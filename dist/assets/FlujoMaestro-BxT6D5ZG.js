import { j as e } from './query-vendor-CzTZLhyg.js';
import { u as ze, r as l } from './react-vendor-CByR7_Pi.js';
import {
  c7 as ei,
  aa as Ee,
  br as fe,
  aF as oe,
  ai as Le,
  c8 as Ie,
  c9 as Ne,
  ag as le,
  V as ue,
  ca as ii,
  z as de,
  X as se,
  e as pe,
  aA as ve,
  Z as si,
  cb as ai,
  W as ni,
  cc as oi,
  n as ci,
  a5 as ri,
  bq as De,
  a as ti,
  aD as li,
  cd as ui,
  ce as di,
  cf as pi,
  cg as vi,
  ch as mi,
  aY as bi,
  bC as fi,
  ci as gi,
  bU as ji,
  bw as xi,
  at as yi,
  a0 as te,
  U as ki,
  cj as hi,
  ay as _i,
  av as Ci,
  b as Pi,
  t as V
} from './ui-vendor-DggzEJgL.js';
import { s as Oe, u as Si } from './index-DpKQy1E-.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-DqxLxWcj.js';
const Ai = {
    titulo: 'Flujo Maestro CCO',
    descripcion:
      'Modelo de procesos completo del sistema CCO, construido en el Modelador de Procesos. Copia fiel del modelo del usuario (importable desde el modelador con Importar; precargado como flujo por defecto con el boton CCO).',
    version: '1.1',
    fecha: '2026-07-18'
  },
  Ri = [
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
  wi = [
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
  me = { _meta: Ai, nodes: Ri, edges: wi },
  qi = {
    titulo: 'MASTER DATA',
    descripcion:
      'Datos maestros del sistema (productos, clientes, direcciones, series, lotes, catálogos). Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Ti = [
    { id: 'n1', type: 'inicio', label: 'Datos Maestros', x: -360, y: 60, w: 128, h: 46 },
    { id: 'n2', type: 'tarea', label: 'Productos', x: -40, y: -40, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Clientes', x: 190, y: -40, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Direcciones', x: -40, y: 60, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Series', x: 190, y: 60, w: 152, h: 54 },
    { id: 'n6', type: 'tarea', label: 'Lotes', x: -40, y: 160, w: 152, h: 54 },
    { id: 'n7', type: 'tarea', label: 'Catálogos', x: 190, y: 160, w: 152, h: 54 }
  ],
  zi = [
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n1', to: 'n3', label: '' },
    { id: 'e3', from: 'n1', to: 'n4', label: '' },
    { id: 'e4', from: 'n1', to: 'n5', label: '' },
    { id: 'e5', from: 'n1', to: 'n6', label: '' },
    { id: 'e6', from: 'n1', to: 'n7', label: '' }
  ],
  Ei = { _meta: qi, nodes: Ti, edges: zi },
  Li = {
    titulo: 'WAREHOUSE (WMS)',
    descripcion:
      'Flujo de bodega: recepción, ubicación, conteo, calidad, ajustes, inventario. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Ii = [
    { id: 'n0', type: 'inicio', label: 'Ingreso Mercadería', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'Recepción', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Ubicación', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Conteo', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Calidad', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Ajustes', x: 480, y: 0, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'Inventario', x: 690, y: 0, w: 128, h: 46 }
  ],
  Ni = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' }
  ],
  Di = { _meta: Li, nodes: Ii, edges: Ni },
  Oi = {
    titulo: 'OPERACIONES',
    descripcion:
      'Ciclo de la Nota de Venta: NV, proceso, picking, packing, shipping. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Mi = [
    { id: 'n0', type: 'inicio', label: 'Registro N.V.', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'NV', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Proceso', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Picking', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Packing', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'fin', label: 'Shipping', x: 480, y: 0, w: 128, h: 46 }
  ],
  Fi = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' }
  ],
  Bi = { _meta: Oi, nodes: Mi, edges: Fi },
  Vi = {
    titulo: 'TMS',
    descripcion:
      'Transporte propio: orden, vehículos, choferes, rutas, GPS y prueba de entrega (POD). Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Gi = [
    { id: 'n1', type: 'inicio', label: 'Orden Transporte', x: -520, y: 60, w: 128, h: 46 },
    { id: 'n2', type: 'tarea', label: 'Vehículos', x: -260, y: -60, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Choferes', x: -260, y: 60, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Rutas', x: -40, y: 60, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'GPS', x: 180, y: 60, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'POD', x: 400, y: 60, w: 128, h: 46 }
  ],
  Ui = [
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n1', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' },
    { id: 'e6', from: 'n2', to: 'n4', label: 'asignar' }
  ],
  Hi = { _meta: Vi, nodes: Gi, edges: Ui },
  $i = {
    titulo: 'POSTVENTA',
    descripcion:
      'Servicio técnico: ticket, agenda, técnico, informe, cliente, cierre. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Qi = [
    { id: 'n0', type: 'inicio', label: 'Solicitud Cliente', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'Ticket', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Agenda', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Técnico', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Informe', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Cliente', x: 480, y: 0, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'Cierre', x: 690, y: 0, w: 128, h: 46 }
  ],
  Ki = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' }
  ],
  Wi = { _meta: $i, nodes: Qi, edges: Ki };
async function Se(o = 'maestro') {
  const { data: m } = await Oe.from('tms_flujo_modelos')
    .select('modelo,titulo,updated_at,updated_by')
    .eq('codigo', o)
    .maybeSingle();
  return m;
}
async function Yi(o, m, g) {
  const { data: _, error: f } = await Oe.rpc('flujo_guardar', {
    p_codigo: o,
    p_titulo: m,
    p_modelo: g
  });
  return f ? { ok: !1, error: f.message } : _ || { ok: !0 };
}
const Xi = {
    name: 'Arquitectura funcional CCO',
    schemaVersion: 2,
    generator: 'scripts/generate_architecture_catalog.mjs',
    sourceVersion: '1.55.156',
    fingerprint: '8d7890e408f5',
    totals: {
      module: 10,
      screen: 70,
      component: 33,
      service: 23,
      function: 281,
      action: 112,
      table: 95,
      rpc: 135,
      'edge-function': 14,
      storage: 1
    }
  },
  Zi = [
    'public',
    'inbound',
    'inventario',
    'queries',
    'quality',
    'panel',
    'asistente',
    'postventa',
    'tms',
    'admin'
  ],
  Ji = {
    public: {
      screen: 4,
      component: 1,
      service: 0,
      function: 0,
      action: 1,
      table: 0,
      rpc: 1,
      'edge-function': 0,
      storage: 0
    },
    inbound: {
      screen: 5,
      component: 0,
      service: 0,
      function: 0,
      action: 16,
      table: 8,
      rpc: 2,
      'edge-function': 0,
      storage: 0
    },
    inventario: {
      screen: 19,
      component: 3,
      service: 3,
      function: 37,
      action: 4,
      table: 9,
      rpc: 22,
      'edge-function': 0,
      storage: 0
    },
    queries: {
      screen: 8,
      component: 0,
      service: 0,
      function: 0,
      action: 15,
      table: 9,
      rpc: 6,
      'edge-function': 0,
      storage: 0
    },
    quality: {
      screen: 4,
      component: 5,
      service: 1,
      function: 63,
      action: 1,
      table: 11,
      rpc: 32,
      'edge-function': 0,
      storage: 0
    },
    panel: {
      screen: 7,
      component: 13,
      service: 6,
      function: 50,
      action: 42,
      table: 13,
      rpc: 23,
      'edge-function': 0,
      storage: 0
    },
    asistente: {
      screen: 0,
      component: 0,
      service: 1,
      function: 1,
      action: 0,
      table: 0,
      rpc: 0,
      'edge-function': 0,
      storage: 0
    },
    postventa: {
      screen: 6,
      component: 0,
      service: 1,
      function: 22,
      action: 1,
      table: 2,
      rpc: 14,
      'edge-function': 0,
      storage: 0
    },
    tms: {
      screen: 2,
      component: 1,
      service: 1,
      function: 13,
      action: 0,
      table: 4,
      rpc: 6,
      'edge-function': 0,
      storage: 0
    },
    admin: {
      screen: 15,
      component: 10,
      service: 10,
      function: 95,
      action: 32,
      table: 39,
      rpc: 29,
      'edge-function': 14,
      storage: 1
    }
  },
  es = [
    {
      status: 'activo',
      id: 'module:public',
      kind: 'module',
      module: 'public',
      label: 'Acceso público',
      description: 'Consultas y solicitudes disponibles sin iniciar sesión.',
      owner: 'Operaciones / Servicio Técnico',
      section: 'platform',
      color: '#0ea5e9'
    },
    {
      status: 'activo',
      id: 'module:inbound',
      kind: 'module',
      module: 'inbound',
      label: 'Inbound',
      description: 'Recepción, carga masiva, cubicaje y ubicación inicial de mercadería.',
      owner: 'Bodega / Recepción',
      section: 'wms',
      color: '#f97316'
    },
    {
      status: 'activo',
      id: 'module:inventario',
      kind: 'module',
      module: 'inventario',
      label: 'Inventario',
      description: 'Stock, ubicaciones, conteos, traspasos, insumos y análisis de códigos.',
      owner: 'Bodega / Inventario',
      section: 'wms',
      color: '#8b5cf6'
    },
    {
      status: 'activo',
      id: 'module:queries',
      kind: 'module',
      module: 'queries',
      label: 'Consultas',
      description: 'Lecturas operativas de N.V., series, lotes, direcciones, fichas y despachos.',
      owner: 'Operaciones',
      section: 'intelligence',
      color: '#0ea5e9'
    },
    {
      status: 'activo',
      id: 'module:quality',
      kind: 'module',
      module: 'quality',
      label: 'Calidad',
      description: 'Hitos de recepción, inventario y salida; informes, acciones y dictámenes.',
      owner: 'Control de Calidad',
      section: 'intelligence',
      color: '#10b981'
    },
    {
      status: 'activo',
      id: 'module:panel',
      kind: 'module',
      module: 'panel',
      label: 'Panel PTM',
      description: 'Ciclo de vida de la Nota de Venta, dashboard, consulta, TV y configuración.',
      owner: 'Operaciones PTM',
      section: 'intelligence',
      color: '#f97316'
    },
    {
      status: 'activo',
      id: 'module:asistente',
      kind: 'module',
      module: 'asistente',
      label: 'Asistente IA',
      description: 'Consultas asistidas sobre información operativa con acceso controlado.',
      owner: 'Operaciones / TI',
      section: 'intelligence',
      color: '#6366f1'
    },
    {
      status: 'activo',
      id: 'module:postventa',
      kind: 'module',
      module: 'postventa',
      label: 'Post-Venta',
      description: 'Ingreso, asignación, agenda, atención técnica, informe y cierre de tickets.',
      owner: 'Servicio Técnico',
      section: 'postventa',
      color: '#ec4899'
    },
    {
      status: 'oculto',
      id: 'module:tms',
      kind: 'module',
      module: 'tms',
      label: 'TMS Transporte',
      description: 'Órdenes, conductores, vehículos, rutas, incidencias y prueba de entrega.',
      owner: 'Transporte',
      section: 'wms',
      color: '#14b8a6'
    },
    {
      status: 'activo',
      id: 'module:admin',
      kind: 'module',
      module: 'admin',
      label: 'Administración y plataforma',
      description: 'IAM, seguridad, observabilidad, cargas, workflows, eventos y APIs.',
      owner: 'TI / Administración',
      section: 'system',
      color: '#334155'
    },
    {
      status: 'activo',
      id: 'screen:login',
      kind: 'screen',
      module: 'public',
      label: 'Inicio de sesión',
      description: 'Pantalla disponible en /login.',
      route: '/login',
      permissions: ['público'],
      source: 'src/pages/Login.jsx'
    },
    {
      status: 'activo',
      id: 'screen:consulta',
      kind: 'screen',
      module: 'public',
      label: 'Consulta pública N.V.',
      description: 'Pantalla disponible en /consulta.',
      route: '/consulta',
      permissions: ['público'],
      source: 'src/pages/Public/ConsultaNV.jsx'
    },
    {
      status: 'activo',
      id: 'screen:verificar',
      kind: 'screen',
      module: 'public',
      label: 'Verificar certificado',
      description: 'Pantalla disponible en /verificar.',
      route: '/verificar',
      permissions: ['público'],
      source: 'src/pages/VerificarCertificado.jsx'
    },
    {
      status: 'activo',
      id: 'screen:soporte',
      kind: 'screen',
      module: 'public',
      label: 'Solicitud pública de soporte',
      description: 'Pantalla disponible en /soporte.',
      route: '/soporte',
      permissions: ['público'],
      source: 'src/pages/Postventa/SolicitudPublica.jsx'
    },
    {
      status: 'activo',
      id: 'screen:seguridad',
      kind: 'screen',
      module: 'admin',
      label: 'Seguridad de mi cuenta',
      description: 'Pantalla disponible en /seguridad.',
      route: '/seguridad',
      permissions: [],
      source: 'src/pages/Seguridad.jsx'
    },
    {
      status: 'activo',
      id: 'screen:tms-control',
      kind: 'screen',
      module: 'tms',
      label: 'TMS · Torre de Control',
      description: 'Pantalla disponible en /tms/control.',
      route: '/tms/control',
      permissions: ['view_tms', 'manage_tms', 'supervise_tms', 'manage_panel'],
      source: 'src/pages/TMS/Transporte.jsx'
    },
    {
      status: 'activo',
      id: 'screen:tms-pda',
      kind: 'screen',
      module: 'tms',
      label: 'TMS · Ruta del conductor',
      description: 'Pantalla disponible en /tms/pda.',
      route: '/tms/pda',
      permissions: ['view_tms', 'manage_tms', 'manage_panel'],
      source: 'src/pages/TMS/MiRuta.jsx'
    },
    {
      status: 'activo',
      id: 'screen:mobile-pda',
      kind: 'screen',
      module: 'inventario',
      label: 'PDA Operativa (Bodega)',
      description: 'Pantalla disponible en /mobile/pda.',
      route: '/mobile/pda',
      permissions: ['view_stock', 'manage_inventory'],
      source: 'src/pages/Mobile/WarehousePDA.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inbound-reception',
      kind: 'screen',
      module: 'inbound',
      label: 'Inbound - Recepción',
      description: 'Pantalla disponible en /inbound/reception.',
      route: '/inbound/reception',
      permissions: ['view_reception', 'process_reception'],
      source: 'src/pages/Inbound/Reception.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inbound-reception-nacional',
      kind: 'screen',
      module: 'inbound',
      label: 'Inbound - Recepción Nacionales',
      description: 'Pantalla disponible en /inbound/reception-nacional.',
      route: '/inbound/reception-nacional',
      permissions: ['view_reception', 'process_reception'],
      source: 'src/pages/Inbound/ReceptionNacional.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inbound-entry',
      kind: 'screen',
      module: 'inbound',
      label: 'Inbound - Putaway',
      description: 'Pantalla disponible en /inbound/entry.',
      route: '/inbound/entry',
      permissions: ['view_entry', 'process_entry'],
      source: 'src/pages/Inbound/Entry.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inbound-cubing',
      kind: 'screen',
      module: 'inbound',
      label: 'Inbound - Cubicaje',
      description: 'Pantalla disponible en /inbound/cubing.',
      route: '/inbound/cubing',
      permissions: ['view_reception', 'process_reception'],
      source: 'src/pages/Inbound/CubingRegistry.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inbound-data-import',
      kind: 'screen',
      module: 'inbound',
      label: 'Inbound - Carga Masiva',
      description: 'Pantalla disponible en /inbound/data-import.',
      route: '/inbound/data-import',
      permissions: ['manage_data_import'],
      source: 'src/pages/Admin/DataImport.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-batches',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Lotes/Series',
      description: 'Pantalla disponible en /queries/batches.',
      route: '/queries/batches',
      permissions: ['view_batches'],
      source: 'src/pages/Queries/Batches.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-sales-status',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Estado N.V.',
      description: 'Pantalla disponible en /queries/sales-status.',
      route: '/queries/sales-status',
      permissions: ['view_sales_status'],
      source: 'src/pages/Queries/SalesStatus.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-addresses',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Direcciones',
      description: 'Pantalla disponible en /queries/addresses.',
      route: '/queries/addresses',
      permissions: ['view_addresses'],
      source: 'src/pages/Queries/Addresses.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-locations',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Ubicaciones',
      description: 'Pantalla disponible en /queries/locations.',
      route: '/queries/locations',
      permissions: ['view_locations'],
      source: 'src/pages/Queries/WmsLocations.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-historial-nv',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Historial N.V.',
      description: 'Pantalla disponible en /queries/historial-nv.',
      route: '/queries/historial-nv',
      permissions: ['view_historial_nv'],
      source: 'src/pages/Queries/HistorialNV.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-dispatch-control',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Control Despacho',
      description: 'Pantalla disponible en /queries/dispatch-control.',
      route: '/queries/dispatch-control',
      permissions: ['view_dispatch_control'],
      source: 'src/pages/Queries/DispatchControl.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-datasheet',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Ficha Técnica',
      description: 'Pantalla disponible en /queries/datasheet.',
      route: '/queries/datasheet',
      permissions: ['view_fichas'],
      source: 'src/pages/Queries/ProductDatasheet.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-grupo',
      kind: 'screen',
      module: 'queries',
      label: 'Consultas - Grupo por SKU',
      description: 'Pantalla disponible en /queries/grupo.',
      route: '/queries/grupo',
      permissions: [
        'view_batches',
        'view_fichas',
        'view_stock',
        'manage_inventory',
        'view_sales_status'
      ],
      source: 'src/pages/Queries/ConsultaGrupo.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Dashboard',
      description: 'Pantalla disponible en /panel.',
      route: '/panel',
      permissions: ['view_panel', 'manage_panel'],
      source: 'src/pages/Panel/PanelLayout.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel-ingresar',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Ingresar N.V.',
      description: 'Pantalla disponible en /panel/ingresar.',
      route: '/panel/ingresar',
      permissions: ['panel_ingresar', 'manage_panel'],
      source: 'src/pages/Panel/screens/PanelIngresar.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel-reaperturas',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Solicitudes de reapertura',
      description: 'Pantalla disponible en /panel/reaperturas.',
      route: '/panel/reaperturas',
      permissions: ['approve_panel_reopen_nv', 'manage_roles'],
      source: null
    },
    {
      status: 'activo',
      id: 'screen:panel-info',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Info N.V.',
      description: 'Pantalla disponible en /panel/info.',
      route: '/panel/info',
      permissions: ['panel_info', 'manage_panel'],
      source: 'src/pages/Panel/info/PanelInfoReal.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel-tv',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Modo TV',
      description: 'Pantalla disponible en /panel/tv.',
      route: '/panel/tv',
      permissions: ['panel_tv', 'manage_panel'],
      source: 'src/pages/Panel/tv/PanelTVReal.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel-builder',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Builder',
      description: 'Pantalla disponible en /panel/builder.',
      route: '/panel/builder',
      permissions: ['panel_builder', 'manage_panel'],
      source: 'src/pages/Panel/builder/PanelBuilderReal.jsx'
    },
    {
      status: 'activo',
      id: 'screen:panel-configuracion',
      kind: 'screen',
      module: 'panel',
      label: 'Panel PTM - Configuración (admin)',
      description: 'Pantalla disponible en /panel/configuracion.',
      route: '/panel/configuracion',
      permissions: ['manage_roles'],
      source: 'src/pages/Panel/config/PanelConfigReal.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-traspasos',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Traspasos y Ajustes',
      description: 'Pantalla disponible en /inventory/traspasos.',
      route: '/inventory/traspasos',
      permissions: [
        'view_traspasos',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'view_reception'
      ],
      source: 'src/pages/Tools/Traspasos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:queries-heatmap',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Mapa de Calor',
      description: 'Pantalla disponible en /queries/heatmap.',
      route: '/queries/heatmap',
      permissions: ['view_locations'],
      source: 'src/pages/Queries/Heatmap.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-locations',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Gestión de Ubicaciones',
      description: 'Pantalla disponible en /admin/locations.',
      route: '/admin/locations',
      permissions: ['manage_locations'],
      source: 'src/pages/Admin/LocationManager.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-location-requests',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Solicitudes de Ubicación',
      description: 'Pantalla disponible en /admin/location-requests.',
      route: '/admin/location-requests',
      permissions: ['manage_locations'],
      source: 'src/pages/Admin/LocationRequests.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo Cíclico (Contar)',
      description: 'Pantalla disponible en /inventory/conteo.',
      route: '/inventory/conteo',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo-tab-sesiones',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo · Sesiones',
      description: 'Pantalla disponible en /inventory/conteo?tab=sesiones.',
      route: '/inventory/conteo?tab=sesiones',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo-tab-conciliacion',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo · Conciliación',
      description: 'Pantalla disponible en /inventory/conteo?tab=conciliacion.',
      route: '/inventory/conteo?tab=conciliacion',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo-tab-ajuste',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo · Ajuste ERP',
      description: 'Pantalla disponible en /inventory/conteo?tab=ajuste.',
      route: '/inventory/conteo?tab=ajuste',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo-tab-bloques',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo · Bloques/QR',
      description: 'Pantalla disponible en /inventory/conteo?tab=bloques.',
      route: '/inventory/conteo?tab=bloques',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-conteo-tab-proyeccion',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Conteo · Proyección',
      description: 'Pantalla disponible en /inventory/conteo?tab=proyeccion.',
      route: '/inventory/conteo?tab=proyeccion',
      permissions: [
        'view_conteo',
        'manage_conteo',
        'supervise_conteo',
        'manage_inventory',
        'conteo_tab_contar',
        'conteo_tab_sesiones',
        'conteo_tab_conciliacion',
        'conteo_tab_ajuste',
        'conteo_tab_bloques',
        'conteo_tab_proyeccion'
      ],
      source: 'src/pages/Inventory/ConteoCiclico.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · Resumen',
      description: 'Pantalla disponible en /inventory/analisis.',
      route: '/inventory/analisis',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis-tab-antiguos-disp',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · Antiguos c/Disponible',
      description: 'Pantalla disponible en /inventory/analisis?tab=antiguos_disp.',
      route: '/inventory/analisis?tab=antiguos_disp',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis-tab-no-activos-stock',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · No Activos c/Stock',
      description: 'Pantalla disponible en /inventory/analisis?tab=no_activos_stock.',
      route: '/inventory/analisis?tab=no_activos_stock',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis-tab-duplicados',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · Duplicados',
      description: 'Pantalla disponible en /inventory/analisis?tab=duplicados.',
      route: '/inventory/analisis?tab=duplicados',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis-tab-anomalias',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · Anomalías',
      description: 'Pantalla disponible en /inventory/analisis?tab=anomalias.',
      route: '/inventory/analisis?tab=anomalias',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-analisis-tab-detalle',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Análisis · Detalle',
      description: 'Pantalla disponible en /inventory/analisis?tab=detalle.',
      route: '/inventory/analisis?tab=detalle',
      permissions: [
        'view_analisis',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'manage_data_import',
        'analisis_tab_resumen',
        'analisis_tab_antiguos',
        'analisis_tab_antiguos_disp',
        'analisis_tab_no_activos',
        'analisis_tab_duplicados',
        'analisis_tab_anomalias',
        'analisis_tab_detalle'
      ],
      source: 'src/pages/Inventory/AnalisisCodigos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-carteles',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Carteles de Bodega',
      description: 'Pantalla disponible en /inventory/carteles.',
      route: '/inventory/carteles',
      permissions: [
        'view_carteles',
        'manage_inventory',
        'view_stock',
        'view_batches',
        'view_reception'
      ],
      source: 'src/pages/Inventory/Carteles.jsx'
    },
    {
      status: 'activo',
      id: 'screen:inventory-insumos',
      kind: 'screen',
      module: 'inventario',
      label: 'Inventario - Panel de Insumos',
      description: 'Pantalla disponible en /inventory/insumos.',
      route: '/inventory/insumos',
      permissions: ['view_insumos', 'manage_insumos', 'manage_inventory', 'view_stock'],
      source: 'src/pages/Inventory/Insumos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:quality-monitoreo',
      kind: 'screen',
      module: 'quality',
      label: 'Calidad - Monitoreo',
      description: 'Pantalla disponible en /quality/monitoreo.',
      route: '/quality/monitoreo',
      permissions: ['manage_monitoreo', 'manage_quality', 'manage_inventory'],
      source: 'src/pages/Quality/Monitoreo.jsx'
    },
    {
      status: 'activo',
      id: 'screen:quality-acciones',
      kind: 'screen',
      module: 'quality',
      label: 'Calidad - Acciones',
      description: 'Pantalla disponible en /quality/acciones.',
      route: '/quality/acciones',
      permissions: ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
      source: 'src/pages/Quality/AccionesCalidad.jsx'
    },
    {
      status: 'activo',
      id: 'screen:quality-bandeja',
      kind: 'screen',
      module: 'quality',
      label: 'Calidad - Mi Bandeja',
      description: 'Pantalla disponible en /quality/bandeja.',
      route: '/quality/bandeja',
      permissions: ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
      source: 'src/pages/Quality/MiBandeja.jsx'
    },
    {
      status: 'activo',
      id: 'screen:quality-clasificacion',
      kind: 'screen',
      module: 'quality',
      label: 'Calidad - Clasificación de Productos',
      description: 'Pantalla disponible en /quality/clasificacion.',
      route: '/quality/clasificacion',
      permissions: ['manage_quality', 'manage_monitoreo'],
      source: 'src/pages/Quality/ClasificacionProductos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Tickets',
      description: 'Pantalla disponible en /postventa/tickets.',
      route: '/postventa/tickets',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets-tab-bandeja',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Bandeja Correos',
      description: 'Pantalla disponible en /postventa/tickets?tab=bandeja.',
      route: '/postventa/tickets?tab=bandeja',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets-tab-calendario',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Calendario',
      description: 'Pantalla disponible en /postventa/tickets?tab=calendario.',
      route: '/postventa/tickets?tab=calendario',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets-tab-nuevo',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Nuevo Ticket',
      description: 'Pantalla disponible en /postventa/tickets?tab=nuevo.',
      route: '/postventa/tickets?tab=nuevo',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets-tab-dashboard',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Dashboard',
      description: 'Pantalla disponible en /postventa/tickets?tab=dashboard.',
      route: '/postventa/tickets?tab=dashboard',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:postventa-tickets-tab-tecnicos',
      kind: 'screen',
      module: 'postventa',
      label: 'Post-Venta - Técnicos',
      description: 'Pantalla disponible en /postventa/tickets?tab=tecnicos.',
      route: '/postventa/tickets?tab=tecnicos',
      permissions: [
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        'pv_tab_tickets',
        'pv_tab_bandeja',
        'pv_tab_calendario',
        'pv_tab_nuevo',
        'pv_tab_dashboard',
        'pv_tab_tecnicos'
      ],
      source: 'src/pages/Postventa/Postventa.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-users',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Usuarios y Roles',
      description: 'Pantalla disponible en /admin/users.',
      route: '/admin/users',
      permissions: ['manage_users', 'view_users'],
      source: 'src/pages/Admin/AccessControl.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-roles',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Roles y Permisos',
      description: 'Pantalla disponible en /admin/roles.',
      route: '/admin/roles',
      permissions: ['manage_roles', 'view_roles'],
      source: 'src/pages/Admin/AccessControl.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-views',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Vistas',
      description: 'Pantalla disponible en /admin/views.',
      route: '/admin/views',
      permissions: ['manage_views', 'view_views'],
      source: 'src/pages/Admin/Views.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-cleanup',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Limpieza',
      description: 'Pantalla disponible en /admin/cleanup.',
      route: '/admin/cleanup',
      permissions: ['manage_cleanup'],
      source: 'src/pages/Admin/Cleanup.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-tickets',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Tickets TI',
      description: 'Pantalla disponible en /admin/tickets.',
      route: '/admin/tickets',
      permissions: ['manage_tickets'],
      source: 'src/pages/Admin/Tickets.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-upload-history',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Historial de Cargas',
      description: 'Pantalla disponible en /admin/upload-history.',
      route: '/admin/upload-history',
      permissions: ['admin_upload_history'],
      source: 'src/pages/Admin/UploadHistory.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-bodegas-softland',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Bodegas Softland',
      description: 'Pantalla disponible en /admin/bodegas-softland.',
      route: '/admin/bodegas-softland',
      permissions: ['manage_locations'],
      source: 'src/pages/Admin/BodegasSoftland.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-monitor',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Monitor Tiempo Real',
      description: 'Pantalla disponible en /admin/monitor.',
      route: '/admin/monitor',
      permissions: ['admin_monitor'],
      source: 'src/pages/Admin/AdminMonitor.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-observability',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Centro de Observabilidad',
      description: 'Pantalla disponible en /admin/observability.',
      route: '/admin/observability',
      permissions: ['admin_monitor'],
      source: 'src/pages/Admin/Observability.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-workflows',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Workflows (procesos)',
      description: 'Pantalla disponible en /admin/workflows.',
      route: '/admin/workflows',
      permissions: ['view_workflows', 'manage_workflows'],
      source: 'src/pages/Admin/Workflows.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-flujo-maestro',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Mapa de Procesos',
      description: 'Pantalla disponible en /admin/flujo-maestro.',
      route: '/admin/flujo-maestro',
      permissions: ['view_workflows', 'manage_workflows'],
      source: 'src/pages/Tools/FlujoMaestro.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-eventos',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Eventos y Notificaciones',
      description: 'Pantalla disponible en /admin/eventos.',
      route: '/admin/eventos',
      permissions: ['view_eventos', 'manage_eventos'],
      source: 'src/pages/Admin/Eventos.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-api',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - API de Operaciones',
      description: 'Pantalla disponible en /admin/api.',
      route: '/admin/api',
      permissions: ['view_api', 'manage_api'],
      source: 'src/pages/Admin/ApiKeys.jsx'
    },
    {
      status: 'activo',
      id: 'screen:admin-rendiciones',
      kind: 'screen',
      module: 'admin',
      label: 'Admin - Rendiciones',
      description: 'Pantalla disponible en /admin/rendiciones.',
      route: '/admin/rendiciones',
      permissions: ['view_rendiciones', 'manage_rendiciones'],
      source: 'src/pages/Admin/Rendiciones.jsx'
    },
    {
      status: 'activo',
      id: 'service:src-pages-panel-builder-builderservice-js',
      kind: 'service',
      module: 'panel',
      label: 'Builder Service',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/pages/Panel/builder/builderService.js'
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:fetchDashboards',
      kind: 'function',
      module: 'panel',
      label: 'fetchDashboards',
      displayLabel: 'Fetch Dashboards',
      description: '── Dashboards ───────────────────────────────────────────────────────────────',
      signature: 'fetchDashboards()',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_dashboard_layouts' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:saveDashboard',
      kind: 'function',
      module: 'panel',
      label: 'saveDashboard',
      displayLabel: 'Save Dashboard',
      description: 'Ejecuta save dashboard; participa en RPC sobre guardar_dashboard.',
      signature: 'saveDashboard(d)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_dashboard' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:deleteDashboard',
      kind: 'function',
      module: 'panel',
      label: 'deleteDashboard',
      displayLabel: 'Delete Dashboard',
      description: 'Ejecuta delete dashboard; participa en RPC sobre eliminar_dashboard.',
      signature: 'deleteDashboard(id)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_dashboard' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      kind: 'function',
      module: 'panel',
      label: 'fetchCalculatedFields',
      displayLabel: 'Fetch Calculated Fields',
      description: '── Campos calculados ────────────────────────────────────────────────────────',
      signature: 'fetchCalculatedFields(incluirInactivos = false)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_builder_calculated_fields' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      kind: 'function',
      module: 'panel',
      label: 'saveCalculatedField',
      displayLabel: 'Save Calculated Field',
      description: 'Ejecuta save calculated field; participa en RPC sobre guardar_campo_calculado.',
      signature: 'saveCalculatedField(f)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_campo_calculado' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      kind: 'function',
      module: 'panel',
      label: 'deleteCalculatedField',
      displayLabel: 'Delete Calculated Field',
      description:
        'Ejecuta delete calculated field; participa en RPC sobre eliminar_campo_calculado.',
      signature: 'deleteCalculatedField(id)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_campo_calculado' }]
    },
    {
      status: 'activo',
      id: 'service:src-pages-panel-config-configservice-js',
      kind: 'service',
      module: 'panel',
      label: 'Config Service',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/pages/Panel/config/configService.js'
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:fetchTransportistas',
      kind: 'function',
      module: 'panel',
      label: 'fetchTransportistas',
      displayLabel: 'Fetch Transportistas',
      description: 'Consulta fetch transportistas y entrega el resultado a la interfaz.',
      signature: 'fetchTransportistas(inc = false)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:saveTransportista',
      kind: 'function',
      module: 'panel',
      label: 'saveTransportista',
      displayLabel: 'Save Transportista',
      description: 'Ejecuta save transportista; participa en lógica de aplicación.',
      signature: 'saveTransportista(f)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:toggleTransportista',
      kind: 'function',
      module: 'panel',
      label: 'toggleTransportista',
      displayLabel: 'Toggle Transportista',
      description: 'Actualiza toggle transportista aplicando las validaciones del servicio.',
      signature: 'toggleTransportista(id, activo)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:deleteTransportista',
      kind: 'function',
      module: 'panel',
      label: 'deleteTransportista',
      displayLabel: 'Delete Transportista',
      description: 'Ejecuta delete transportista; participa en lógica de aplicación.',
      signature: 'deleteTransportista(id)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:fetchVendedores',
      kind: 'function',
      module: 'panel',
      label: 'fetchVendedores',
      displayLabel: 'Fetch Vendedores',
      description: 'Consulta fetch vendedores y entrega el resultado a la interfaz.',
      signature: 'fetchVendedores(inc = false)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:saveVendedor',
      kind: 'function',
      module: 'panel',
      label: 'saveVendedor',
      displayLabel: 'Save Vendedor',
      description: 'Ejecuta save vendedor; participa en lógica de aplicación.',
      signature: 'saveVendedor(f)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:toggleVendedor',
      kind: 'function',
      module: 'panel',
      label: 'toggleVendedor',
      displayLabel: 'Toggle Vendedor',
      description: 'Actualiza toggle vendedor aplicando las validaciones del servicio.',
      signature: 'toggleVendedor(id, activo)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:deleteVendedor',
      kind: 'function',
      module: 'panel',
      label: 'deleteVendedor',
      displayLabel: 'Delete Vendedor',
      description: 'Ejecuta delete vendedor; participa en lógica de aplicación.',
      signature: 'deleteVendedor(id)',
      source: 'src/pages/Panel/config/configService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:fetchAuditoria',
      kind: 'function',
      module: 'panel',
      label: 'fetchAuditoria',
      displayLabel: 'Fetch Auditoria',
      description: '── Auditoría (bitácora de cambios de operaciones) ──────────────────────────',
      signature: "fetchAuditoria({ operador = '', accion = '', nv = '', limit = 150 } = {})",
      source: 'src/pages/Panel/config/configService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_operaciones_log' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      kind: 'function',
      module: 'panel',
      label: 'fetchAuditStatsPanel',
      displayLabel: 'Fetch Audit Stats Panel',
      description:
        'Consulta fetch audit stats panel sobre tms_operaciones_log y entrega el resultado a la interfaz.',
      signature: 'fetchAuditStatsPanel()',
      source: 'src/pages/Panel/config/configService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_operaciones_log' }]
    },
    {
      status: 'activo',
      id: 'service:src-pages-panel-ingresar-ingresarservice-js',
      kind: 'service',
      module: 'panel',
      label: 'Ingresar Service',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/pages/Panel/ingresar/ingresarService.js'
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:colorFor',
      kind: 'function',
      module: 'panel',
      label: 'colorFor',
      displayLabel: 'Color For',
      description: 'Ejecuta color for; participa en lógica de aplicación.',
      signature: 'colorFor(v)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:esClienteOrange',
      kind: 'function',
      module: 'panel',
      label: 'esClienteOrange',
      displayLabel: 'Es Cliente Orange',
      description: 'Ejecuta es cliente orange; participa en lógica de aplicación.',
      signature: 'esClienteOrange(cliente)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:listaActivas',
      kind: 'function',
      module: 'panel',
      label: 'listaActivas',
      displayLabel: 'Lista Activas',
      description: 'Ejecuta lista activas; participa en lectura.',
      signature: 'listaActivas({ force = false, full = true, limit = 400 } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperaciones',
      kind: 'function',
      module: 'panel',
      label: 'buscarOperaciones',
      displayLabel: 'Buscar Operaciones',
      description:
        'Búsqueda en TODA la tabla (cualquier estado: incluye Entregado/NULA/etc.) por nº de N.V., cliente, vendedor, guía, factura o transportista. Sirve para que en Buscar se pueda encontrar y abrir una N.V. ya entregada o cerrada, que la lista de',
      signature: 'buscarOperaciones(term, { limit = 300, signal } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura', 'eliminación'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperacionesUltraLocal',
      kind: 'function',
      module: 'panel',
      label: 'buscarOperacionesUltraLocal',
      displayLabel: 'Buscar Operaciones Ultra Local',
      description: 'Consulta buscar operaciones ultra local y entrega el resultado a la interfaz.',
      signature: 'buscarOperacionesUltraLocal(rows, term, { limit = 120 } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:fusionarResultadosBusqueda',
      kind: 'function',
      module: 'panel',
      label: 'fusionarResultadosBusqueda',
      displayLabel: 'Fusionar Resultados Busqueda',
      description: 'Ejecuta fusionar resultados busqueda; participa en lógica de aplicación.',
      signature: 'fusionarResultadosBusqueda(localRows, remoteRows, term, { limit = 160 } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:opciones',
      kind: 'function',
      module: 'panel',
      label: 'opciones',
      displayLabel: 'Opciones',
      description: '── Opciones del formulario ─────────────────────────────────────────────────',
      signature: 'opciones({ force = false, includeHistoricos = false } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_panel_transportistas' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      kind: 'function',
      module: 'panel',
      label: 'buscarNvCatalogo',
      displayLabel: 'Buscar Nv Catalogo',
      description: 'Catálogo maestro NV → cliente/vendedor (hojas CARGA). Fuente precisa.',
      signature: 'buscarNvCatalogo(canal, nv)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura', 'eliminación'],
      resources: [
        { kind: 'table', name: 'tms_nv_catalogo' },
        { kind: 'table', name: 'tms_panel_vendedores' }
      ]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:costoDeVendedor',
      kind: 'function',
      module: 'panel',
      label: 'costoDeVendedor',
      displayLabel: 'Costo De Vendedor',
      description: 'Ejecuta costo de vendedor; participa en lógica de aplicación.',
      signature: 'costoDeVendedor(vendedor)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      kind: 'function',
      module: 'panel',
      label: 'lookup',
      displayLabel: 'Lookup',
      description: 'Ejecuta lookup; participa en lectura, eliminación.',
      signature: 'lookup(canal, nv)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura', 'eliminación'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      kind: 'function',
      module: 'panel',
      label: 'lookupById',
      displayLabel: 'Lookup By Id',
      description: 'Ejecuta lookup by id; participa en lectura.',
      signature: 'lookupById(id, { canal = null, nv = null } = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupOrangeAssociation',
      kind: 'function',
      module: 'panel',
      label: 'lookupOrangeAssociation',
      displayLabel: 'Lookup Orange Association',
      description: 'Ejecuta lookup orange association; participa en lógica de aplicación.',
      signature: 'lookupOrangeAssociation(nv, fallback = {})',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:exportarOperaciones',
      kind: 'function',
      module: 'panel',
      label: 'exportarOperaciones',
      displayLabel: 'Exportar Operaciones',
      description: 'Ejecuta exportar operaciones; participa en lectura.',
      signature: 'exportarOperaciones()',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:guardar',
      kind: 'function',
      module: 'panel',
      label: 'guardar',
      displayLabel: 'Guardar',
      description: 'Registra guardar sobre guardar_nv y devuelve el resultado de la operación.',
      signature: 'guardar(payload)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      kind: 'function',
      module: 'panel',
      label: 'puedeEditarOperacion',
      displayLabel: 'Puede Editar Operacion',
      description: 'Ejecuta puede editar operacion; participa en RPC sobre iam_puede_editar_nv.',
      signature: 'puedeEditarOperacion(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_puede_editar_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      kind: 'function',
      module: 'panel',
      label: 'puedeCambiarEstadoOperacion',
      displayLabel: 'Puede Cambiar Estado Operacion',
      description:
        'Ejecuta puede cambiar estado operacion; participa en RPC sobre iam_puede_cambiar_estado_nv.',
      signature: 'puedeCambiarEstadoOperacion(id, estado = null)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_puede_cambiar_estado_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      kind: 'function',
      module: 'panel',
      label: 'cambiarEstado',
      displayLabel: 'Cambiar Estado',
      description:
        'Actualiza cambiar estado sobre cambiar_estado_nv aplicando las validaciones del servicio.',
      signature: 'cambiarEstado(id, estado, urgente = null)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'cambiar_estado_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      kind: 'function',
      module: 'panel',
      label: 'corregirEstadoAShipping',
      displayLabel: 'Corregir Estado AShipping',
      description:
        'Edición inline por columnas: mapea nombres de columna → claves del RPC guardar_nv.',
      signature: 'corregirEstadoAShipping(id, motivo)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'corregir_estado_nv_a_shipping' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      kind: 'function',
      module: 'panel',
      label: 'gestionarPausaShipping',
      displayLabel: 'Gestionar Pausa Shipping',
      description:
        'Ejecuta gestionar pausa shipping; participa en RPC sobre gestionar_pausa_shipping_nv.',
      signature: "gestionarPausaShipping(id, subestado = null, motivo = '')",
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'gestionar_pausa_shipping_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      kind: 'function',
      module: 'panel',
      label: 'reportarIncidenciaArmado',
      displayLabel: 'Reportar Incidencia Armado',
      description:
        'Ejecuta reportar incidencia armado; participa en RPC sobre reportar_incidencia_armado_nv.',
      signature: 'reportarIncidenciaArmado(id, observacion)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'reportar_incidencia_armado_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      kind: 'function',
      module: 'panel',
      label: 'actualizarCampos',
      displayLabel: 'Actualizar Campos',
      description:
        'Actualiza actualizar campos sobre guardar_nv aplicando las validaciones del servicio.',
      signature: 'actualizarCampos(id, dirty)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      kind: 'function',
      module: 'panel',
      label: 'listarSolicitudesReapertura',
      displayLabel: 'Listar Solicitudes Reapertura',
      description:
        'Consulta listar solicitudes reapertura sobre tms_nv_reaperturas y entrega el resultado a la interfaz.',
      signature: 'listarSolicitudesReapertura(operacionId)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_nv_reaperturas' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      kind: 'function',
      module: 'panel',
      label: 'solicitarReapertura',
      displayLabel: 'Solicitar Reapertura',
      description: 'Ejecuta solicitar reapertura; participa en RPC sobre solicitar_reapertura_nv.',
      signature: 'solicitarReapertura(id, motivo)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'solicitar_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      kind: 'function',
      module: 'panel',
      label: 'resolverReapertura',
      displayLabel: 'Resolver Reapertura',
      description:
        'Actualiza resolver reapertura sobre resolver_reapertura_nv aplicando las validaciones del servicio.',
      signature: "resolverReapertura(requestId, aprobar, observacion = '')",
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      kind: 'function',
      module: 'panel',
      label: 'eliminar',
      displayLabel: 'Eliminar',
      description: 'Elimina o revoca eliminar sobre eliminar_nv según las reglas de acceso.',
      signature: 'eliminar(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      kind: 'function',
      module: 'panel',
      label: 'listarConsolidados',
      displayLabel: 'Listar Consolidados',
      description: '── Consolidados ─────────────────────────────────────────────────────────────',
      signature: 'listarConsolidados()',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_consolidados' },
        { kind: 'table', name: 'tms_consolidado_nvs' }
      ]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      kind: 'function',
      module: 'panel',
      label: 'guardarConsolidado',
      displayLabel: 'Guardar Consolidado',
      description:
        'Registra guardar consolidado sobre guardar_consolidado y devuelve el resultado de la operación.',
      signature: 'guardarConsolidado(p)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_consolidado' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      kind: 'function',
      module: 'panel',
      label: 'eliminarConsolidado',
      displayLabel: 'Eliminar Consolidado',
      description:
        'Elimina o revoca eliminar consolidado sobre eliminar_consolidado según las reglas de acceso.',
      signature: 'eliminarConsolidado(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_consolidado' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvBasico',
      kind: 'function',
      module: 'panel',
      label: 'buscarNvBasico',
      displayLabel: 'Buscar Nv Basico',
      description: 'Valida una N.V. (para armar consolidados): busca en los 4 canales.',
      signature: 'buscarNvBasico(nv)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-pages-panel-reaperturas-reopenrequestsservice-js',
      kind: 'service',
      module: 'panel',
      label: 'Reopen Requests Service',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js'
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      kind: 'function',
      module: 'panel',
      label: 'fetchReopenInbox',
      displayLabel: 'Fetch Reopen Inbox',
      description:
        'Consulta fetch reopen inbox sobre listar_bandeja_reaperturas_nv y entrega el resultado a la interfaz.',
      signature: "fetchReopenInbox({ status = '', search = '', limit = 200 } = {})",
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'listar_bandeja_reaperturas_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      kind: 'function',
      module: 'panel',
      label: 'resolveReopenRequest',
      displayLabel: 'Resolve Reopen Request',
      description:
        'Actualiza resolve reopen request sobre resolver_reapertura_nv aplicando las validaciones del servicio.',
      signature: "resolveReopenRequest(requestId, approve, observation = '')",
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:subscribeToReopenRequests',
      kind: 'function',
      module: 'panel',
      label: 'subscribeToReopenRequests',
      displayLabel: 'Subscribe To Reopen Requests',
      description: 'Ejecuta subscribe to reopen requests; participa en Realtime.',
      signature: 'subscribeToReopenRequests(onChange)',
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-pages-panel-rutas-routecoordinationservice-js',
      kind: 'service',
      module: 'panel',
      label: 'Route Coordination Service',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/pages/Panel/rutas/routeCoordinationService.js'
    },
    {
      status: 'activo',
      id: 'service:src-services-analisisservice-js',
      kind: 'service',
      module: 'inventario',
      label: 'Analisis Service',
      description: 'Capa de acceso y reglas reutilizables de Inventario.',
      source: 'src/services/analisisService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:useAnalisisResumen',
      kind: 'function',
      module: 'inventario',
      label: 'useAnalisisResumen',
      displayLabel: 'Analisis Resumen',
      description:
        'Consulta analisis resumen sobre analisis_codigos_resumen y entrega el resultado a la interfaz.',
      signature: 'useAnalisisResumen()',
      source: 'src/services/analisisService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'analisis_codigos_resumen' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      kind: 'function',
      module: 'inventario',
      label: 'useAnalisisCodigos',
      displayLabel: 'Analisis Codigos',
      description:
        'Consulta analisis codigos sobre analisis_codigos y entrega el resultado a la interfaz.',
      signature: "useAnalisisCodigos(filtro = 'todos', q = '')",
      source: 'src/services/analisisService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'analisis_codigos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:enviarAEmil',
      kind: 'function',
      module: 'inventario',
      label: 'enviarAEmil',
      displayLabel: 'Enviar AEmil',
      description:
        'Registra enviar aemil sobre tms_emil_sync y devuelve el resultado de la operación.',
      signature:
        "enviarAEmil({ tipo, rows, accion = 'DESCONTAR', obs = '', cantidadDe = 'disponible' })",
      source: 'src/services/analisisService.js',
      operations: ['lectura', 'upsert'],
      resources: [{ kind: 'table', name: 'tms_emil_sync' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:useEnviarEmil',
      kind: 'function',
      module: 'inventario',
      label: 'useEnviarEmil',
      displayLabel: 'Enviar Emil',
      description: 'Consulta enviar emil y entrega el resultado a la interfaz.',
      signature: 'useEnviarEmil()',
      source: 'src/services/analisisService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:useCargarActivo',
      kind: 'function',
      module: 'inventario',
      label: 'useCargarActivo',
      displayLabel: 'Cargar Activo',
      description:
        'Carga del catálogo ACTIVO (hoja del ERP con la marca Si/No) → upsert por código en tms_productos_activo (bulk_upsert, chunks para no exceder payload).',
      signature: 'useCargarActivo()',
      source: 'src/services/analisisService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'bulk_upsert' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:useCargarStock',
      kind: 'function',
      module: 'inventario',
      label: 'useCargarStock',
      displayLabel: 'Cargar Stock',
      description:
        'Consulta cargar stock sobre bulk_upsert, tms_inventario_general y entrega el resultado a la interfaz.',
      signature: 'useCargarStock()',
      source: 'src/services/analisisService.js',
      operations: ['eliminación', 'RPC'],
      resources: [
        { kind: 'rpc', name: 'bulk_upsert' },
        { kind: 'table', name: 'tms_inventario_general' }
      ]
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:parseStockFile',
      kind: 'function',
      module: 'inventario',
      label: 'parseStockFile',
      displayLabel: 'Parse Stock File',
      description: 'Ejecuta parse stock file; participa en lógica de aplicación.',
      signature: 'parseStockFile(file)',
      source: 'src/services/analisisService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-analisisservice-js:parseActivoFile',
      kind: 'function',
      module: 'inventario',
      label: 'parseActivoFile',
      displayLabel: 'Parse Activo File',
      description:
        'Parsea el Excel/CSV del catálogo ACTIVO: detecta la fila de encabezados y mapea columnas por nombre (Código producto / Descripción / U. medida / Activo).',
      signature: 'parseActivoFile(file)',
      source: 'src/services/analisisService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-apiservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Api Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/apiService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-apiservice-js:listarApiKeys',
      kind: 'function',
      module: 'admin',
      label: 'listarApiKeys',
      displayLabel: 'Listar Api Keys',
      description:
        'Consulta listar api keys sobre api_keys_listar y entrega el resultado a la interfaz.',
      signature: 'listarApiKeys()',
      source: 'src/services/apiService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'api_keys_listar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-apiservice-js:crearApiKey',
      kind: 'function',
      module: 'admin',
      label: 'crearApiKey',
      displayLabel: 'Crear Api Key',
      description:
        'Registra crear api key sobre api_key_crear y devuelve el resultado de la operación.',
      signature: 'crearApiKey(nombre, scopes)',
      source: 'src/services/apiService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'api_key_crear' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-apiservice-js:revocarApiKey',
      kind: 'function',
      module: 'admin',
      label: 'revocarApiKey',
      displayLabel: 'Revocar Api Key',
      description:
        'Elimina o revoca revocar api key sobre api_key_revocar según las reglas de acceso.',
      signature: 'revocarApiKey(id)',
      source: 'src/services/apiService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'api_key_revocar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-apiservice-js:listarApiLog',
      kind: 'function',
      module: 'admin',
      label: 'listarApiLog',
      displayLabel: 'Listar Api Log',
      description:
        'Consulta listar api log sobre api_log_listar y entrega el resultado a la interfaz.',
      signature: 'listarApiLog()',
      source: 'src/services/apiService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'api_log_listar' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-asistenteservice-js',
      kind: 'service',
      module: 'asistente',
      label: 'Asistente Service',
      description: 'Capa de acceso y reglas reutilizables de Asistente IA.',
      source: 'src/services/asistenteService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-asistenteservice-js:preguntarAsistente',
      kind: 'function',
      module: 'asistente',
      label: 'preguntarAsistente',
      displayLabel: 'Preguntar Asistente',
      description: "messages: [{ role:'user'|'assistant', content:string }] → texto de respuesta.",
      signature: 'preguntarAsistente(messages)',
      source: 'src/services/asistenteService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-calidadservice-js',
      kind: 'service',
      module: 'quality',
      label: 'Calidad Service',
      description: 'Capa de acceso y reglas reutilizables de Calidad.',
      source: 'src/services/calidadService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useInformes',
      kind: 'function',
      module: 'quality',
      label: 'useInformes',
      displayLabel: 'Informes',
      description: '── Lectura de informes ───────────────────────────────────────────────────',
      signature: 'useInformes()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_informes' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useInformeItems',
      kind: 'function',
      module: 'quality',
      label: 'useInformeItems',
      displayLabel: 'Informe Items',
      description:
        'Consulta informe items sobre tms_monitoreo_items y entrega el resultado a la interfaz.',
      signature: 'useInformeItems(informeId)',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_items' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:fetchCandidatos',
      kind: 'function',
      module: 'quality',
      label: 'fetchCandidatos',
      displayLabel: 'Fetch Candidatos',
      description:
        '── Candidatos a monitoreo (stock actual + ubicación + semáforo) ─────────── Guarda de timeout (15s): evita que el spinner quede "cargando eternamente" si la promesa de supabase-js no se resuelve (p. ej. bloqueo de auth-lock en WebView o con',
      signature: 'fetchCandidatos(query, soloVencimiento = false)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'monitoreo_candidatos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:fetchCandidatosSalida',
      kind: 'function',
      module: 'quality',
      label: 'fetchCandidatosSalida',
      displayLabel: 'Fetch Candidatos Salida',
      description:
        'Candidatos exclusivos de Hito 3 / Salida. A diferencia del monitoreo de inventario, incluye SKUs históricos aunque ya no tengan stock WMS positivo.',
      signature: 'fetchCandidatosSalida(query, limit = 100)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'calidad_salida_candidatos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:fetchLotesSeries',
      kind: 'function',
      module: 'quality',
      label: 'fetchLotesSeries',
      displayLabel: 'Fetch Lotes Series',
      description: '── Lotes y series de un producto (para elegir en la toma) ─────────────────',
      signature: "fetchLotesSeries(codigo, query = '')",
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'calidad_lotes_series' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:pushAdminInventario',
      kind: 'function',
      module: 'quality',
      label: 'pushAdminInventario',
      displayLabel: 'Push Admin Inventario',
      description:
        '── Push a móvil (ADMIN) — Edge Function notify-inventario (FCM v1) ───────── Genérico; no bloquea el flujo si falla.',
      signature: 'pushAdminInventario({ title, body, payload })',
      source: 'src/services/calidadService.js',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'notify-inventario' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:notificarInventarioPush',
      kind: 'function',
      module: 'quality',
      label: 'notificarInventarioPush',
      displayLabel: 'Notificar Inventario Push',
      description: 'Alerta por SKU no registrado hallado en auditoría.',
      signature: 'notificarInventarioPush(alertas, informeId)',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:notificarDictamenPush',
      kind: 'function',
      module: 'quality',
      label: 'notificarDictamenPush',
      displayLabel: 'Notificar Dictamen Push',
      description: 'Aviso por dictamen que requiere movimiento (Cuarentena / Rechazar / Baja).',
      signature: 'notificarDictamenPush({ codigo, ubicacion, estadoLabel, tipo })',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:marcarPreliminarCalidad',
      kind: 'function',
      module: 'quality',
      label: 'marcarPreliminarCalidad',
      displayLabel: 'Marcar Preliminar Calidad',
      description:
        '── Reflejo preliminar en Ubicaciones al enviar a Calidad ────────────────── Genera flags EN_AUDITORIA en tms_calidad_flags para los ítems con condición problemática (≠ OK) y ubicación, para que se vean de inmediato en Ubicaciones.',
      signature: 'marcarPreliminarCalidad(informeId)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'monitoreo_marcar_preliminar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCrearInforme',
      kind: 'function',
      module: 'quality',
      label: 'useCrearInforme',
      displayLabel: 'Crear Informe',
      description:
        '── Crear informe + ítems (RPC transaccional: cabecera + número + ítems en una sola transacción; el número se genera bajo lock → sin cabecera huérfana ni carrera del correlativo). ────────────────────────────────────────────────',
      signature: 'useCrearInforme()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useActualizarEstadoInforme',
      kind: 'function',
      module: 'quality',
      label: 'useActualizarEstadoInforme',
      displayLabel: 'Actualizar Estado Informe',
      description: '── Cambiar estado de un informe (ej. enviar a Calidad) ────────────────────',
      signature: 'useActualizarEstadoInforme()',
      source: 'src/services/calidadService.js',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_informes' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useActualizarInforme',
      kind: 'function',
      module: 'quality',
      label: 'useActualizarInforme',
      displayLabel: 'Actualizar Informe',
      description:
        '── Editar informe (cabecera + reemplazo de ítems) ───────────────────────── Usado por el informe de MONITOREO rutinario. RPC transaccional: si el INSERT de ítems falla, TODO revierte (incluido el DELETE) → nunca deja el informe sin ítems (a',
      signature: 'useActualizarInforme()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'actualizar_informe_monitoreo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useEliminarInforme',
      kind: 'function',
      module: 'quality',
      label: 'useEliminarInforme',
      displayLabel: 'Eliminar Informe',
      description: '── Eliminar informe (cascade borra ítems y evidencias) ────────────────────',
      signature: 'useEliminarInforme()',
      source: 'src/services/calidadService.js',
      operations: ['eliminación'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_informes' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      kind: 'function',
      module: 'quality',
      label: 'useGuardarInformeDanos',
      displayLabel: 'Guardar Informe Danos',
      description:
        'Guarda (crea o actualiza) un informe de daños conservando los IDs de los hallazgos (ítems) existentes, para no romper las evidencias asociadas.',
      signature: 'useGuardarInformeDanos()',
      source: 'src/services/calidadService.js',
      operations: ['lectura', 'creación', 'actualización', 'eliminación', 'RPC', 'archivo'],
      resources: [
        { kind: 'rpc', name: 'monitoreo_next_numero' },
        { kind: 'table', name: 'tms_monitoreo_informes' },
        { kind: 'table', name: 'tms_monitoreo_items' },
        { kind: 'table', name: 'tms_monitoreo_evidencias' }
      ]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useInformeEvidencias',
      kind: 'function',
      module: 'quality',
      label: 'useInformeEvidencias',
      displayLabel: 'Informe Evidencias',
      description:
        'Consulta informe evidencias sobre tms_monitoreo_evidencias y entrega el resultado a la interfaz.',
      signature: 'useInformeEvidencias(informeId)',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_evidencias' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:uploadEvidencia',
      kind: 'function',
      module: 'quality',
      label: 'uploadEvidencia',
      displayLabel: 'Upload Evidencia',
      description: 'Sube una imagen (blob ya comprimido) y registra la fila de evidencia.',
      signature: 'uploadEvidencia({ informeId, itemId, blob, descripcion, user })',
      source: 'src/services/calidadService.js',
      operations: ['lectura', 'creación', 'archivo'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_evidencias' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:deleteEvidencia',
      kind: 'function',
      module: 'quality',
      label: 'deleteEvidencia',
      displayLabel: 'Delete Evidencia',
      description:
        'Ejecuta delete evidencia; participa en eliminación, archivo sobre tms_monitoreo_evidencias.',
      signature: 'deleteEvidencia(ev)',
      source: 'src/services/calidadService.js',
      operations: ['eliminación', 'archivo'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_evidencias' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:updateEvidenciaDescripcion',
      kind: 'function',
      module: 'quality',
      label: 'updateEvidenciaDescripcion',
      displayLabel: 'Update Evidencia Descripcion',
      description:
        'Ejecuta update evidencia descripcion; participa en actualización sobre tms_monitoreo_evidencias.',
      signature: 'updateEvidenciaDescripcion(id, descripcion)',
      source: 'src/services/calidadService.js',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_monitoreo_evidencias' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useDictaminar',
      kind: 'function',
      module: 'quality',
      label: 'useDictaminar',
      displayLabel: 'Dictaminar',
      description: '── Dictamen de Calidad (RPC: persiste dictamen + flag + notificación) ─────',
      signature: 'useDictaminar()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'monitoreo_dictaminar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCategoriasTarea',
      kind: 'function',
      module: 'quality',
      label: 'useCategoriasTarea',
      displayLabel: 'Categorias Tarea',
      description:
        'Familias de producto presentes en la recepción de una tarea (criterios de aceptación específicos + flags regulatorios). Alimenta el checklist por familia.',
      signature: 'useCategoriasTarea(tareaId)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'calidad_categorias_tarea' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:cargarClasificacionGrupos',
      kind: 'function',
      module: 'quality',
      label: 'cargarClasificacionGrupos',
      displayLabel: 'Cargar Clasificacion Grupos',
      description:
        'Carga/actualización del mapeo producto→grupo (clasificación) y reclasificación.',
      signature: 'cargarClasificacionGrupos(rows)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'calidad_cargar_clasificacion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:reclasificarRecepciones',
      kind: 'function',
      module: 'quality',
      label: 'reclasificarRecepciones',
      displayLabel: 'Reclasificar Recepciones',
      description:
        'Actualiza reclasificar recepciones sobre calidad_reclasificar_recepciones aplicando las validaciones del servicio.',
      signature: 'reclasificarRecepciones()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'calidad_reclasificar_recepciones' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useTareasChecklist',
      kind: 'function',
      module: 'quality',
      label: 'useTareasChecklist',
      displayLabel: 'Tareas Checklist',
      description:
        'Lista de tareas de checklist (cola). Pendientes/en proceso primero. staleTime 0 + refetchOnMount → al abrir la pestaña siempre trae lo último (una recepción recién registrada aparece de inmediato); realtime complementa.',
      signature: 'useTareasChecklist()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_calidad_tareas' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useTareasPendientesCount',
      kind: 'function',
      module: 'quality',
      label: 'useTareasPendientesCount',
      displayLabel: 'Tareas Pendientes Count',
      description: 'Nº de tareas pendientes/en proceso (para badge).',
      signature: 'useTareasPendientesCount()',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useFirmarCertificado',
      kind: 'function',
      module: 'quality',
      label: 'useFirmarCertificado',
      displayLabel: 'Firmar Certificado',
      description: 'Firma electrónica del certificado/acta (HMAC-SHA256 server-side).',
      signature: 'useFirmarCertificado()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'firmar_certificado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:verificarCertificado',
      kind: 'function',
      module: 'quality',
      label: 'verificarCertificado',
      displayLabel: 'Verificar Certificado',
      description: 'Verificación pública por folio (para el QR / página de verificación).',
      signature: 'verificarCertificado(folio)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'verificar_certificado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAsignacionesCalidad',
      kind: 'function',
      module: 'quality',
      label: 'useAsignacionesCalidad',
      displayLabel: 'Asignaciones Calidad',
      description: 'Cola de asignaciones del hito 2 (pendientes/en proceso primero).',
      signature: 'useAsignacionesCalidad()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_calidad_asignaciones' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAsignacionesPendientesCount',
      kind: 'function',
      module: 'quality',
      label: 'useAsignacionesPendientesCount',
      displayLabel: 'Asignaciones Pendientes Count',
      description: 'Nº de asignaciones pendientes/en proceso (badge del hito 2).',
      signature: 'useAsignacionesPendientesCount()',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCrearAsignacion',
      kind: 'function',
      module: 'quality',
      label: 'useCrearAsignacion',
      displayLabel: 'Crear Asignacion',
      description: 'Crear asignación (Inventario asigna SKUs a Calidad).',
      signature: 'useCrearAsignacion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:tomarAsignacionCalidad',
      kind: 'function',
      module: 'quality',
      label: 'tomarAsignacionCalidad',
      displayLabel: 'Tomar Asignacion Calidad',
      description:
        'Ejecuta tomar asignacion calidad; participa en RPC sobre tomar_asignacion_calidad.',
      signature: 'tomarAsignacionCalidad(asignacionId)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tomar_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:guardarProgresoAsignacionCalidad',
      kind: 'function',
      module: 'quality',
      label: 'guardarProgresoAsignacionCalidad',
      displayLabel: 'Guardar Progreso Asignacion Calidad',
      description:
        'Registra guardar progreso asignacion calidad sobre guardar_progreso_asignacion_calidad y devuelve el resultado de la operación.',
      signature: 'guardarProgresoAsignacionCalidad(asignacionId, progressData)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_progreso_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:liberarAsignacionCalidad',
      kind: 'function',
      module: 'quality',
      label: 'liberarAsignacionCalidad',
      displayLabel: 'Liberar Asignacion Calidad',
      description:
        'Ejecuta liberar asignacion calidad; participa en RPC sobre liberar_asignacion_calidad.',
      signature: 'liberarAsignacionCalidad(asignacionId)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'liberar_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useResolverAsignacion',
      kind: 'function',
      module: 'quality',
      label: 'useResolverAsignacion',
      displayLabel: 'Resolver Asignacion',
      description: 'Resolver asignación enlazando el informe/dictamen generado.',
      signature: 'useResolverAsignacion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAnularAsignacion',
      kind: 'function',
      module: 'quality',
      label: 'useAnularAsignacion',
      displayLabel: 'Anular Asignacion',
      description: 'Anular asignación (antes de resolver).',
      signature: 'useAnularAsignacion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'anular_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:riesgoIngreso',
      kind: 'function',
      module: 'quality',
      label: 'riesgoIngreso',
      displayLabel: 'Riesgo Ingreso',
      description: 'Ejecuta riesgo ingreso; participa en lógica de aplicación.',
      signature: 'riesgoIngreso(checklist)',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:indicadoresIso',
      kind: 'function',
      module: 'quality',
      label: 'indicadoresIso',
      displayLabel: 'Indicadores Iso',
      description: 'Indicadores ISO del checklist (alimentan dashboards y van al pie del doc).',
      signature: 'indicadoresIso(tarea)',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:resultadoPeso',
      kind: 'function',
      module: 'quality',
      label: 'resultadoPeso',
      displayLabel: 'Resultado Peso',
      description: 'Ejecuta resultado peso; participa en lógica de aplicación.',
      signature: 'resultadoPeso(esperado, registrado)',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:semaforoSalida',
      kind: 'function',
      module: 'quality',
      label: 'semaforoSalida',
      displayLabel: 'Semaforo Salida',
      description: 'Ejecuta semaforo salida; participa en lógica de aplicación.',
      signature: 'semaforoSalida(tarea)',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:uploadEvidenciaSalida',
      kind: 'function',
      module: 'quality',
      label: 'uploadEvidenciaSalida',
      displayLabel: 'Upload Evidencia Salida',
      description:
        'Evidencia fotográfica del certificado de salida: el archivo va al bucket privado de evidencias (salida/<tareaId>/…) y la referencia queda en checklist._extras.evidencias — asociada (y firmada) con el certificado.',
      signature: 'uploadEvidenciaSalida({ tareaId, tipo, blob })',
      source: 'src/services/calidadService.js',
      operations: ['archivo'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:deleteEvidenciaSalida',
      kind: 'function',
      module: 'quality',
      label: 'deleteEvidenciaSalida',
      displayLabel: 'Delete Evidencia Salida',
      description: 'Ejecuta delete evidencia salida; participa en archivo.',
      signature: 'deleteEvidenciaSalida(path)',
      source: 'src/services/calidadService.js',
      operations: ['archivo'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:uploadEvidenciaIngreso',
      kind: 'function',
      module: 'quality',
      label: 'uploadEvidenciaIngreso',
      displayLabel: 'Upload Evidencia Ingreso',
      description: 'Ejecuta upload evidencia ingreso; participa en archivo.',
      signature: 'uploadEvidenciaIngreso({ tareaId, tipo, blob })',
      source: 'src/services/calidadService.js',
      operations: ['archivo'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useTareasSalida',
      kind: 'function',
      module: 'quality',
      label: 'useTareasSalida',
      displayLabel: 'Tareas Salida',
      description: 'Cola de certificaciones de salida (tipo CERTIFICADO_SALIDA).',
      signature: 'useTareasSalida()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_calidad_tareas' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useSalidaPendientesCount',
      kind: 'function',
      module: 'quality',
      label: 'useSalidaPendientesCount',
      displayLabel: 'Salida Pendientes Count',
      description: 'Consulta salida pendientes count y entrega el resultado a la interfaz.',
      signature: 'useSalidaPendientesCount()',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:buscarDespachos',
      kind: 'function',
      module: 'quality',
      label: 'buscarDespachos',
      displayLabel: 'Buscar Despachos',
      description: 'Buscar despachos para certificar (por NV, cliente o guía).',
      signature: 'buscarDespachos(query)',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_control_despacho' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCrearTareaSalida',
      kind: 'function',
      module: 'quality',
      label: 'useCrearTareaSalida',
      displayLabel: 'Crear Tarea Salida',
      description: 'Crear la tarea de certificación de salida a partir de un despacho.',
      signature: 'useCrearTareaSalida()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_tarea_salida' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCrearTareaSalidaManual',
      kind: 'function',
      module: 'quality',
      label: 'useCrearTareaSalidaManual',
      displayLabel: 'Crear Tarea Salida Manual',
      description: 'Crear la tarea de certificación de salida MANUAL (N.V. escrita a mano + SKUs).',
      signature: 'useCrearTareaSalidaManual()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_tarea_salida_manual' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useEliminarTareaCalidad',
      kind: 'function',
      module: 'quality',
      label: 'useEliminarTareaCalidad',
      displayLabel: 'Eliminar Tarea Calidad',
      description:
        '── Borrado por ADMIN (limpieza de pruebas) ──────────────────────────────── Elimina una tarea de calidad (hito 1 checklist de ingreso / hito 3 salida).',
      signature: 'useEliminarTareaCalidad()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_tarea_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useEliminarAsignacionCalidad',
      kind: 'function',
      module: 'quality',
      label: 'useEliminarAsignacionCalidad',
      displayLabel: 'Eliminar Asignacion Calidad',
      description: 'Elimina una asignación de estancia (hito 2).',
      signature: 'useEliminarAsignacionCalidad()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_asignacion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useBodegasSoftland',
      kind: 'function',
      module: 'quality',
      label: 'useBodegasSoftland',
      displayLabel: 'Bodegas Softland',
      description: '── Bodegas Softland (catálogo para el destino del dictamen) ────────────────',
      signature: 'useBodegasSoftland()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_bodegas_softland' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useBodegasDestino',
      kind: 'function',
      module: 'quality',
      label: 'useBodegasDestino',
      displayLabel: 'Bodegas Destino',
      description: 'Solo las que sirven como destino del dictamen (activas).',
      signature: 'useBodegasDestino()',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useGuardarBodegaSoftland',
      kind: 'function',
      module: 'quality',
      label: 'useGuardarBodegaSoftland',
      displayLabel: 'Guardar Bodega Softland',
      description:
        'Consulta guardar bodega softland sobre guardar_bodega_softland y entrega el resultado a la interfaz.',
      signature: 'useGuardarBodegaSoftland()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_bodega_softland' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useEliminarBodegaSoftland',
      kind: 'function',
      module: 'quality',
      label: 'useEliminarBodegaSoftland',
      displayLabel: 'Eliminar Bodega Softland',
      description:
        'Consulta eliminar bodega softland sobre eliminar_bodega_softland y entrega el resultado a la interfaz.',
      signature: 'useEliminarBodegaSoftland()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_bodega_softland' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useTrazabilidadProducto',
      kind: 'function',
      module: 'quality',
      label: 'useTrazabilidadProducto',
      displayLabel: 'Trazabilidad Producto',
      description:
        'Consulta trazabilidad producto sobre trazabilidad_producto y entrega el resultado a la interfaz.',
      signature: 'useTrazabilidadProducto(codigo, partida, ubicacion)',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'trazabilidad_producto' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAreasCalidad',
      kind: 'function',
      module: 'quality',
      label: 'useAreasCalidad',
      displayLabel: 'Areas Calidad',
      description:
        'Áreas responsables (con su mapeo de roles, para saber si el usuario puede cerrar).',
      signature: 'useAreasCalidad()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_areas_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAccionesCalidad',
      kind: 'function',
      module: 'quality',
      label: 'useAccionesCalidad',
      displayLabel: 'Acciones Calidad',
      description: 'Cola/tablero de acciones (pendientes primero).',
      signature: 'useAccionesCalidad()',
      source: 'src/services/calidadService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_calidad_acciones' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAccionesPendientesCount',
      kind: 'function',
      module: 'quality',
      label: 'useAccionesPendientesCount',
      displayLabel: 'Acciones Pendientes Count',
      description: 'Consulta acciones pendientes count y entrega el resultado a la interfaz.',
      signature: 'useAccionesPendientesCount()',
      source: 'src/services/calidadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useCrearAccion',
      kind: 'function',
      module: 'quality',
      label: 'useCrearAccion',
      displayLabel: 'Crear Accion',
      description: 'Crear (promulgar) una acción desde un ítem dictaminado.',
      signature: 'useCrearAccion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_accion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useResolverAccion',
      kind: 'function',
      module: 'quality',
      label: 'useResolverAccion',
      displayLabel: 'Resolver Accion',
      description: 'Resolver (cerrar) una acción — la cierra el área responsable o admin.',
      signature: 'useResolverAccion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_accion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAnularAccion',
      kind: 'function',
      module: 'quality',
      label: 'useAnularAccion',
      displayLabel: 'Anular Accion',
      description:
        'Consulta anular accion sobre anular_accion_calidad y entrega el resultado a la interfaz.',
      signature: 'useAnularAccion()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'anular_accion_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAccionATicketPv',
      kind: 'function',
      module: 'quality',
      label: 'useAccionATicketPv',
      displayLabel: 'Accion ATicket Pv',
      description:
        'Acción → ticket de Servicio Técnico (Post-Venta) con el informe de calidad adjunto.',
      signature: 'useAccionATicketPv()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'accion_a_ticket_pv' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAccionCorreoEnviado',
      kind: 'function',
      module: 'quality',
      label: 'useAccionCorreoEnviado',
      displayLabel: 'Accion Correo Enviado',
      description:
        '"Correo enviado" desde Inventario (carpeta CALIDAD TRAZABILIDAD en Traspasos): resuelve la tarea de Calidad automáticamente según el dictamen (acuse auto "Correo de traspaso enviado · Dictamen X · Acción Y → BD Z").',
      signature: 'useAccionCorreoEnviado()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'accion_correo_enviado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useAccionReferencia',
      kind: 'function',
      module: 'quality',
      label: 'useAccionReferencia',
      displayLabel: 'Accion Referencia',
      description:
        'Registrar la referencia de ejecución (traspaso/correo generado por Inventario) → la acción pasa a EN_PROCESO y queda en la trazabilidad.',
      signature: 'useAccionReferencia()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'accion_registrar_referencia' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-calidadservice-js:useGuardarChecklist',
      kind: 'function',
      module: 'quality',
      label: 'useGuardarChecklist',
      displayLabel: 'Guardar Checklist',
      description: 'Guardar (parcial) o finalizar (CONFORME/NO_CONFORME) el checklist.',
      signature: 'useGuardarChecklist()',
      source: 'src/services/calidadService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_checklist_ingreso' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-conteoservice-js',
      kind: 'service',
      module: 'inventario',
      label: 'Conteo Service',
      description: 'Capa de acceso y reglas reutilizables de Inventario.',
      source: 'src/services/conteoService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:estadoConteoMeta',
      kind: 'function',
      module: 'inventario',
      label: 'estadoConteoMeta',
      displayLabel: 'Estado Conteo Meta',
      description: 'Consulta estado conteo meta y entrega el resultado a la interfaz.',
      signature: 'estadoConteoMeta(e)',
      source: 'src/services/conteoService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:conteoStockSistema',
      kind: 'function',
      module: 'inventario',
      label: 'conteoStockSistema',
      displayLabel: 'Conteo Stock Sistema',
      description: 'Stock del sistema en vivo (prioridad serie > partida > total del SKU).',
      signature: "conteoStockSistema(codigo, partida = '', serie = '')",
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'conteo_stock_sistema' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useSesionesConteo',
      kind: 'function',
      module: 'inventario',
      label: 'useSesionesConteo',
      displayLabel: 'Sesiones Conteo',
      description: '── Sesiones de conteo ─────────────────────────────────────────────────────',
      signature: 'useSesionesConteo()',
      source: 'src/services/conteoService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_conteo_sesiones' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useCrearSesion',
      kind: 'function',
      module: 'inventario',
      label: 'useCrearSesion',
      displayLabel: 'Crear Sesion',
      description:
        'Consulta crear sesion sobre crear_conteo_sesion y entrega el resultado a la interfaz.',
      signature: 'useCrearSesion()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_conteo_sesion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useCerrarSesion',
      kind: 'function',
      module: 'inventario',
      label: 'useCerrarSesion',
      displayLabel: 'Cerrar Sesion',
      description:
        'Consulta cerrar sesion sobre cerrar_conteo_sesion y entrega el resultado a la interfaz.',
      signature: 'useCerrarSesion()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'cerrar_conteo_sesion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useConteos',
      kind: 'function',
      module: 'inventario',
      label: 'useConteos',
      displayLabel: 'Conteos',
      description: '── Conteos (registros) ─────────────────────────────────────────────────────',
      signature: 'useConteos(sesionId, limit = 60)',
      source: 'src/services/conteoService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_conteos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useRegistrarConteo',
      kind: 'function',
      module: 'inventario',
      label: 'useRegistrarConteo',
      displayLabel: 'Registrar Conteo',
      description:
        'Consulta registrar conteo sobre registrar_conteo y entrega el resultado a la interfaz.',
      signature: 'useRegistrarConteo()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'registrar_conteo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useEditarConteo',
      kind: 'function',
      module: 'inventario',
      label: 'useEditarConteo',
      displayLabel: 'Editar Conteo',
      description:
        'Consulta editar conteo sobre editar_conteo y entrega el resultado a la interfaz.',
      signature: 'useEditarConteo()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'editar_conteo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useEliminarConteo',
      kind: 'function',
      module: 'inventario',
      label: 'useEliminarConteo',
      displayLabel: 'Eliminar Conteo',
      description:
        'Consulta eliminar conteo sobre eliminar_conteo y entrega el resultado a la interfaz.',
      signature: 'useEliminarConteo()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_conteo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useConciliacion',
      kind: 'function',
      module: 'inventario',
      label: 'useConciliacion',
      displayLabel: 'Conciliacion',
      description: '── Reportes ────────────────────────────────────────────────────────────────',
      signature: 'useConciliacion(sesionId)',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'conteo_conciliacion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useAjusteErp',
      kind: 'function',
      module: 'inventario',
      label: 'useAjusteErp',
      displayLabel: 'Ajuste Erp',
      description:
        'Consulta ajuste erp sobre conteo_ajuste_erp y entrega el resultado a la interfaz.',
      signature: 'useAjusteErp(sesionId)',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'conteo_ajuste_erp' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:resumenAnalisis',
      kind: 'function',
      module: 'inventario',
      label: 'resumenAnalisis',
      displayLabel: 'Resumen Analisis',
      description: 'Resumen valorizado (análisis) derivado de la conciliación.',
      signature: 'resumenAnalisis(conciliacion = [])',
      source: 'src/services/conteoService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useBloques',
      kind: 'function',
      module: 'inventario',
      label: 'useBloques',
      displayLabel: 'Bloques',
      description: '── Bloques + auditoría (QR) ─────────────────────────────────────────────────',
      signature: "useBloques(q = '')",
      source: 'src/services/conteoService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_conteo_bloques' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useBloque',
      kind: 'function',
      module: 'inventario',
      label: 'useBloque',
      displayLabel: 'Bloque',
      description:
        'Consulta bloque sobre tms_conteo_bloques, tms_conteo_bloque_items, tms_conteo_auditorias y entrega el resultado a la interfaz.',
      signature: 'useBloque(codigo)',
      source: 'src/services/conteoService.js',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_conteo_bloques' },
        { kind: 'table', name: 'tms_conteo_bloque_items' },
        { kind: 'table', name: 'tms_conteo_auditorias' }
      ]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useCrearBloque',
      kind: 'function',
      module: 'inventario',
      label: 'useCrearBloque',
      displayLabel: 'Crear Bloque',
      description:
        'Consulta crear bloque sobre crear_conteo_bloque y entrega el resultado a la interfaz.',
      signature: 'useCrearBloque()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_conteo_bloque' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useEditarBloque',
      kind: 'function',
      module: 'inventario',
      label: 'useEditarBloque',
      displayLabel: 'Editar Bloque',
      description:
        'Consulta editar bloque sobre editar_conteo_bloque y entrega el resultado a la interfaz.',
      signature: 'useEditarBloque()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'editar_conteo_bloque' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      kind: 'function',
      module: 'inventario',
      label: 'useAgregarBloqueItem',
      displayLabel: 'Agregar Bloque Item',
      description:
        'Consulta agregar bloque item sobre agregar_conteo_bloque_item y entrega el resultado a la interfaz.',
      signature: 'useAgregarBloqueItem()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'agregar_conteo_bloque_item' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      kind: 'function',
      module: 'inventario',
      label: 'useEliminarBloqueItem',
      displayLabel: 'Eliminar Bloque Item',
      description:
        'Consulta eliminar bloque item sobre eliminar_conteo_bloque_item y entrega el resultado a la interfaz.',
      signature: 'useEliminarBloqueItem()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_conteo_bloque_item' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      kind: 'function',
      module: 'inventario',
      label: 'useRegistrarAuditoria',
      displayLabel: 'Registrar Auditoria',
      description:
        'Consulta registrar auditoria sobre registrar_conteo_auditoria y entrega el resultado a la interfaz.',
      signature: 'useRegistrarAuditoria()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'registrar_conteo_auditoria' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useProyecciones',
      kind: 'function',
      module: 'inventario',
      label: 'useProyecciones',
      displayLabel: 'Proyecciones',
      description: '── Proyecciones (palletizado) ──────────────────────────────────────────────',
      signature: 'useProyecciones()',
      source: 'src/services/conteoService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_conteo_proyecciones' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      kind: 'function',
      module: 'inventario',
      label: 'useGuardarProyeccion',
      displayLabel: 'Guardar Proyeccion',
      description:
        'Consulta guardar proyeccion sobre guardar_conteo_proyeccion y entrega el resultado a la interfaz.',
      signature: 'useGuardarProyeccion()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_conteo_proyeccion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      kind: 'function',
      module: 'inventario',
      label: 'useEliminarProyeccion',
      displayLabel: 'Eliminar Proyeccion',
      description:
        'Consulta eliminar proyeccion sobre eliminar_conteo_proyeccion y entrega el resultado a la interfaz.',
      signature: 'useEliminarProyeccion()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_conteo_proyeccion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-conteoservice-js:useGuardarCosto',
      kind: 'function',
      module: 'inventario',
      label: 'useGuardarCosto',
      displayLabel: 'Guardar Costo',
      description:
        'Consulta guardar costo sobre guardar_conteo_costo y entrega el resultado a la interfaz.',
      signature: 'useGuardarCosto()',
      source: 'src/services/conteoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_conteo_costo' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-downloadservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Download Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/downloadService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-downloadservice-js:saveReportBlob',
      kind: 'function',
      module: 'admin',
      label: 'saveReportBlob',
      displayLabel: 'Save Report Blob',
      description: 'Ejecuta save report blob; participa en lógica de aplicación.',
      signature: 'saveReportBlob(blob, requestedFilename, options = {})',
      source: 'src/services/downloadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-downloadservice-js:downloadPdfDocument',
      kind: 'function',
      module: 'admin',
      label: 'downloadPdfDocument',
      displayLabel: 'Download Pdf Document',
      description: 'Ejecuta download pdf document; participa en lógica de aplicación.',
      signature: 'downloadPdfDocument(pdfDocument, filename, options = {})',
      source: 'src/services/downloadService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-eventosservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Eventos Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/eventosService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:listarEventos',
      kind: 'function',
      module: 'admin',
      label: 'listarEventos',
      displayLabel: 'Listar Eventos',
      description:
        'Consulta listar eventos sobre dominio_eventos y entrega el resultado a la interfaz.',
      signature: 'listarEventos({ agregado, limit = 100 } = {})',
      source: 'src/services/eventosService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'dominio_eventos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:listarReglas',
      kind: 'function',
      module: 'admin',
      label: 'listarReglas',
      displayLabel: 'Listar Reglas',
      description:
        'Consulta listar reglas sobre notificacion_regla y entrega el resultado a la interfaz.',
      signature: 'listarReglas()',
      source: 'src/services/eventosService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'notificacion_regla' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:guardarRegla',
      kind: 'function',
      module: 'admin',
      label: 'guardarRegla',
      displayLabel: 'Guardar Regla',
      description: 'Registra guardar regla y devuelve el resultado de la operación.',
      signature: 'guardarRegla(p)',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:eliminarRegla',
      kind: 'function',
      module: 'admin',
      label: 'eliminarRegla',
      displayLabel: 'Eliminar Regla',
      description: 'Elimina o revoca eliminar regla según las reglas de acceso.',
      signature: 'eliminarRegla(id)',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:listarBandeja',
      kind: 'function',
      module: 'admin',
      label: 'listarBandeja',
      displayLabel: 'Listar Bandeja',
      description:
        'Consulta listar bandeja sobre notificacion y entrega el resultado a la interfaz.',
      signature: 'listarBandeja({ canal, estado, limit = 150 } = {})',
      source: 'src/services/eventosService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'notificacion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:metricasProceso',
      kind: 'function',
      module: 'admin',
      label: 'metricasProceso',
      displayLabel: 'Metricas Proceso',
      description: 'Ejecuta metricas proceso; participa en lógica de aplicación.',
      signature: 'metricasProceso(workflow)',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:misNotificaciones',
      kind: 'function',
      module: 'admin',
      label: 'misNotificaciones',
      displayLabel: 'Mis Notificaciones',
      description: 'Consulta mis notificaciones y entrega el resultado a la interfaz.',
      signature: 'misNotificaciones()',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:marcarLeida',
      kind: 'function',
      module: 'admin',
      label: 'marcarLeida',
      displayLabel: 'Marcar Leida',
      description: 'Actualiza marcar leida aplicando las validaciones del servicio.',
      signature: 'marcarLeida(id)',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:marcarTodasLeidas',
      kind: 'function',
      module: 'admin',
      label: 'marcarTodasLeidas',
      displayLabel: 'Marcar Todas Leidas',
      description: 'Actualiza marcar todas leidas aplicando las validaciones del servicio.',
      signature: 'marcarTodasLeidas()',
      source: 'src/services/eventosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-eventosservice-js:despacharPush',
      kind: 'function',
      module: 'admin',
      label: 'despacharPush',
      displayLabel: 'Despachar Push',
      description:
        'Despacha las notificaciones push pendientes vía la Edge notify-inventario (FCM/Capgo).',
      signature: 'despacharPush()',
      source: 'src/services/eventosService.js',
      operations: ['lectura', 'RPC', 'Edge Function'],
      resources: [
        { kind: 'edge-function', name: 'notify-inventario' },
        { kind: 'rpc', name: 'notif_marcar_enviadas' },
        { kind: 'table', name: 'notificacion' }
      ]
    },
    {
      status: 'activo',
      id: 'service:src-services-flujoservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Flujo Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/flujoService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-flujoservice-js:obtenerFlujo',
      kind: 'function',
      module: 'admin',
      label: 'obtenerFlujo',
      displayLabel: 'Obtener Flujo',
      description:
        'Consulta obtener flujo sobre tms_flujo_modelos y entrega el resultado a la interfaz.',
      signature: "obtenerFlujo(codigo = 'maestro')",
      source: 'src/services/flujoService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_flujo_modelos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-flujoservice-js:guardarFlujo',
      kind: 'function',
      module: 'admin',
      label: 'guardarFlujo',
      displayLabel: 'Guardar Flujo',
      description:
        'Registra guardar flujo sobre flujo_guardar y devuelve el resultado de la operación.',
      signature: 'guardarFlujo(codigo, titulo, modelo)',
      source: 'src/services/flujoService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'flujo_guardar' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-iamservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Iam Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/iamService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:catalogoScope',
      kind: 'function',
      module: 'admin',
      label: 'catalogoScope',
      displayLabel: 'Catalogo Scope',
      description: 'Catálogos para la UI (usuarios, roles, centros de costo).',
      signature: 'catalogoScope()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:listarAsignaciones',
      kind: 'function',
      module: 'admin',
      label: 'listarAsignaciones',
      displayLabel: 'Listar Asignaciones',
      description: 'Asignaciones con ámbito (todas o de un usuario).',
      signature: 'listarAsignaciones(userId = null)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:asignarScope',
      kind: 'function',
      module: 'admin',
      label: 'asignarScope',
      displayLabel: 'Asignar Scope',
      description: "Otorgar un rol con ámbito (p.ej. OPERADOR sobre centro_costo '150').",
      signature: 'asignarScope(userId, role, scopeType, scopeCode, expires = null)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:revocarAsignacion',
      kind: 'function',
      module: 'admin',
      label: 'revocarAsignacion',
      displayLabel: 'Revocar Asignacion',
      description: 'Elimina o revoca revocar asignacion según las reglas de acceso.',
      signature: 'revocarAsignacion(id)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:misScopes',
      kind: 'function',
      module: 'admin',
      label: 'misScopes',
      displayLabel: 'Mis Scopes',
      description:
        'Ámbitos del usuario en sesión para un permiso → { all: bool, codes: [...] }. Úsalo para filtrar datos por centro de costo cuando el módulo lo adopte.',
      signature: "misScopes(code, scopeType = 'centro_costo')",
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:sesiones',
      kind: 'function',
      module: 'admin',
      label: 'sesiones',
      displayLabel: 'Sesiones',
      description: '── Fase 5: Sesiones + Auditoría (admin) ────────────────────────────────────',
      signature: 'sesiones()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:forzarLogout',
      kind: 'function',
      module: 'admin',
      label: 'forzarLogout',
      displayLabel: 'Forzar Logout',
      description: 'Actualiza forzar logout aplicando las validaciones del servicio.',
      signature: 'forzarLogout(authUid)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:auditoria',
      kind: 'function',
      module: 'admin',
      label: 'auditoria',
      displayLabel: 'Auditoria',
      description: 'Ejecuta auditoria; participa en lógica de aplicación.',
      signature: 'auditoria(filtros = {})',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:auditoriaMeta',
      kind: 'function',
      module: 'admin',
      label: 'auditoriaMeta',
      displayLabel: 'Auditoria Meta',
      description: 'Ejecuta auditoria meta; participa en lógica de aplicación.',
      signature: 'auditoriaMeta()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:permisosStats',
      kind: 'function',
      module: 'admin',
      label: 'permisosStats',
      displayLabel: 'Permisos Stats',
      description: '── Fase 7: Escala (MV de permisos + carga masiva) ──────────────────────────',
      signature: 'permisosStats()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:refrescarPermisos',
      kind: 'function',
      module: 'admin',
      label: 'refrescarPermisos',
      displayLabel: 'Refrescar Permisos',
      description: 'Actualiza refrescar permisos aplicando las validaciones del servicio.',
      signature: 'refrescarPermisos()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:bulkUsuarios',
      kind: 'function',
      module: 'admin',
      label: 'bulkUsuarios',
      displayLabel: 'Bulk Usuarios',
      description:
        'rows: [{ nombre, email, rol, password? }] → { creados, actualizados, errores[], detalle[] }',
      signature: 'bulkUsuarios(rows)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:listarPolicies',
      kind: 'function',
      module: 'admin',
      label: 'listarPolicies',
      displayLabel: 'Listar Policies',
      description: '── Fase 8: Políticas condicionales (ABAC) ──────────────────────────────────',
      signature: 'listarPolicies()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:guardarPolicy',
      kind: 'function',
      module: 'admin',
      label: 'guardarPolicy',
      displayLabel: 'Guardar Policy',
      description: 'Registra guardar policy y devuelve el resultado de la operación.',
      signature: 'guardarPolicy(p)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:togglePolicy',
      kind: 'function',
      module: 'admin',
      label: 'togglePolicy',
      displayLabel: 'Toggle Policy',
      description: 'Actualiza toggle policy aplicando las validaciones del servicio.',
      signature: 'togglePolicy(id, activo)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:probarEditarNV',
      kind: 'function',
      module: 'admin',
      label: 'probarEditarNV',
      displayLabel: 'Probar Editar NV',
      description: 'Probador del ejemplo N.V.: ¿puede el usuario (o yo) editar la N.V. p_id?',
      signature: 'probarEditarNV(id, uid = null)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:delegaciones',
      kind: 'function',
      module: 'admin',
      label: 'delegaciones',
      displayLabel: 'Delegaciones',
      description: '── Fase 9: Delegación / sustituciones ──────────────────────────────────────',
      signature: 'delegaciones(soloActivas = false)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:delegar',
      kind: 'function',
      module: 'admin',
      label: 'delegar',
      displayLabel: 'Delegar',
      description: 'Registra delegar y devuelve el resultado de la operación.',
      signature:
        'delegar({ delegado, hasta, desde = null, role = null, motivo = null, delegador = null })',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:revocarDelegacion',
      kind: 'function',
      module: 'admin',
      label: 'revocarDelegacion',
      displayLabel: 'Revocar Delegacion',
      description: 'Elimina o revoca revocar delegacion según las reglas de acceso.',
      signature: 'revocarDelegacion(id)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:misCoberturas',
      kind: 'function',
      module: 'admin',
      label: 'misCoberturas',
      displayLabel: 'Mis Coberturas',
      description: 'Consulta mis coberturas y entrega el resultado a la interfaz.',
      signature: 'misCoberturas()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:usuariosLite',
      kind: 'function',
      module: 'admin',
      label: 'usuariosLite',
      displayLabel: 'Usuarios Lite',
      description: 'Lista ligera de usuarios (id+nombre) para selectores (cualquier autenticado).',
      signature: 'usuariosLite()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:historialAcceso',
      kind: 'function',
      module: 'admin',
      label: 'historialAcceso',
      displayLabel: 'Historial Acceso',
      description: '── Historial de accesos (ingresos) ─────────────────────────────────────────',
      signature: 'historialAcceso(filtros = {})',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:historialAccesoResumen',
      kind: 'function',
      module: 'admin',
      label: 'historialAccesoResumen',
      displayLabel: 'Historial Acceso Resumen',
      description: 'Ejecuta historial acceso resumen; participa en lógica de aplicación.',
      signature: 'historialAccesoResumen()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:catalogoOrg',
      kind: 'function',
      module: 'admin',
      label: 'catalogoOrg',
      displayLabel: 'Catalogo Org',
      description: '── Fase 10: Equipos / Grupos / Principals ───────────────────────────────────',
      signature: 'catalogoOrg()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:listarTeams',
      kind: 'function',
      module: 'admin',
      label: 'listarTeams',
      displayLabel: 'Listar Teams',
      description: 'Consulta listar teams y entrega el resultado a la interfaz.',
      signature: 'listarTeams()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:guardarTeam',
      kind: 'function',
      module: 'admin',
      label: 'guardarTeam',
      displayLabel: 'Guardar Team',
      description: 'Registra guardar team y devuelve el resultado de la operación.',
      signature: 'guardarTeam(p)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:eliminarTeam',
      kind: 'function',
      module: 'admin',
      label: 'eliminarTeam',
      displayLabel: 'Eliminar Team',
      description: 'Elimina o revoca eliminar team según las reglas de acceso.',
      signature: 'eliminarTeam(id)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:miembrosTeam',
      kind: 'function',
      module: 'admin',
      label: 'miembrosTeam',
      displayLabel: 'Miembros Team',
      description: 'Ejecuta miembros team; participa en lógica de aplicación.',
      signature: 'miembrosTeam(teamId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:agregarMiembroTeam',
      kind: 'function',
      module: 'admin',
      label: 'agregarMiembroTeam',
      displayLabel: 'Agregar Miembro Team',
      description: 'Registra agregar miembro team y devuelve el resultado de la operación.',
      signature: 'agregarMiembroTeam(teamId, userId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:quitarMiembroTeam',
      kind: 'function',
      module: 'admin',
      label: 'quitarMiembroTeam',
      displayLabel: 'Quitar Miembro Team',
      description: 'Elimina o revoca quitar miembro team según las reglas de acceso.',
      signature: 'quitarMiembroTeam(teamId, userId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:listarGroups',
      kind: 'function',
      module: 'admin',
      label: 'listarGroups',
      displayLabel: 'Listar Groups',
      description: 'Consulta listar groups y entrega el resultado a la interfaz.',
      signature: 'listarGroups()',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:guardarGroup',
      kind: 'function',
      module: 'admin',
      label: 'guardarGroup',
      displayLabel: 'Guardar Group',
      description: 'Registra guardar group y devuelve el resultado de la operación.',
      signature: 'guardarGroup(p)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:eliminarGroup',
      kind: 'function',
      module: 'admin',
      label: 'eliminarGroup',
      displayLabel: 'Eliminar Group',
      description: 'Elimina o revoca eliminar group según las reglas de acceso.',
      signature: 'eliminarGroup(id)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:miembrosGroup',
      kind: 'function',
      module: 'admin',
      label: 'miembrosGroup',
      displayLabel: 'Miembros Group',
      description: 'Ejecuta miembros group; participa en lógica de aplicación.',
      signature: 'miembrosGroup(groupId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:agregarMiembroGroup',
      kind: 'function',
      module: 'admin',
      label: 'agregarMiembroGroup',
      displayLabel: 'Agregar Miembro Group',
      description: 'Registra agregar miembro group y devuelve el resultado de la operación.',
      signature: 'agregarMiembroGroup(groupId, userId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:quitarMiembroGroup',
      kind: 'function',
      module: 'admin',
      label: 'quitarMiembroGroup',
      displayLabel: 'Quitar Miembro Group',
      description: 'Elimina o revoca quitar miembro group según las reglas de acceso.',
      signature: 'quitarMiembroGroup(groupId, userId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:asignacionesPrincipal',
      kind: 'function',
      module: 'admin',
      label: 'asignacionesPrincipal',
      displayLabel: 'Asignaciones Principal',
      description: 'Ejecuta asignaciones principal; participa en lógica de aplicación.',
      signature: 'asignacionesPrincipal(principalType, principalId)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:asignarRolPrincipal',
      kind: 'function',
      module: 'admin',
      label: 'asignarRolPrincipal',
      displayLabel: 'Asignar Rol Principal',
      description: 'Registra asignar rol principal y devuelve el resultado de la operación.',
      signature:
        "asignarRolPrincipal({ principalType, principalId, role, scopeType = 'global', scopeCode = null, expires = null })",
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:revocarAsignacionPrincipal',
      kind: 'function',
      module: 'admin',
      label: 'revocarAsignacionPrincipal',
      displayLabel: 'Revocar Asignacion Principal',
      description: 'Elimina o revoca revocar asignacion principal según las reglas de acceso.',
      signature: 'revocarAsignacionPrincipal(id)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-iamservice-js:refrescarGruposDinamicos',
      kind: 'function',
      module: 'admin',
      label: 'refrescarGruposDinamicos',
      displayLabel: 'Refrescar Grupos Dinamicos',
      description: 'Actualiza refrescar grupos dinamicos aplicando las validaciones del servicio.',
      signature: 'refrescarGruposDinamicos(groupId = null)',
      source: 'src/services/iamService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-insumosservice-js',
      kind: 'service',
      module: 'inventario',
      label: 'Insumos Service',
      description: 'Capa de acceso y reglas reutilizables de Inventario.',
      source: 'src/services/insumosService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:semaforo',
      kind: 'function',
      module: 'inventario',
      label: 'semaforo',
      displayLabel: 'Semaforo',
      description: 'Semáforo: rojo (<= crítico) · amarillo (<= bajo) · verde (> bajo).',
      signature: 'semaforo(i)',
      source: 'src/services/insumosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:listarInsumos',
      kind: 'function',
      module: 'inventario',
      label: 'listarInsumos',
      displayLabel: 'Listar Insumos',
      description:
        'Consulta listar insumos sobre tms_insumos y entrega el resultado a la interfaz.',
      signature: 'listarInsumos()',
      source: 'src/services/insumosService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_insumos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:setCantidad',
      kind: 'function',
      module: 'inventario',
      label: 'setCantidad',
      displayLabel: 'Set Cantidad',
      description: 'Ejecuta set cantidad; participa en RPC sobre insumos_set_cantidad.',
      signature: 'setCantidad(id, cantidad)',
      source: 'src/services/insumosService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'insumos_set_cantidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:guardarInsumo',
      kind: 'function',
      module: 'inventario',
      label: 'guardarInsumo',
      displayLabel: 'Guardar Insumo',
      description:
        'Registra guardar insumo sobre insumos_guardar y devuelve el resultado de la operación.',
      signature: 'guardarInsumo(payload)',
      source: 'src/services/insumosService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'insumos_guardar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:eliminarInsumo',
      kind: 'function',
      module: 'inventario',
      label: 'eliminarInsumo',
      displayLabel: 'Eliminar Insumo',
      description:
        'Elimina o revoca eliminar insumo sobre insumos_eliminar según las reglas de acceso.',
      signature: 'eliminarInsumo(id)',
      source: 'src/services/insumosService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'insumos_eliminar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-insumosservice-js:armarCorreoSolicitud',
      kind: 'function',
      module: 'inventario',
      label: 'armarCorreoSolicitud',
      displayLabel: 'Armar Correo Solicitud',
      description:
        'Construye el correo de solicitud (asunto + cuerpo texto plano en tabla alineada + cuerpo HTML con tabla real para pegar en Outlook/Gmail). items: [{ nombre, categoria, medida, codigo_ptm, unidad, cantidad, pedir }]',
      signature: "armarCorreoSolicitud(items, { solicitante = '' } = {})",
      source: 'src/services/insumosService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-mobileservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Mobile Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/mobileService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:onUpdateAvailable',
      kind: 'function',
      module: 'admin',
      label: 'onUpdateAvailable',
      displayLabel: 'On Update Available',
      description: 'Ejecuta on update available; participa en lógica de aplicación.',
      signature: 'onUpdateAvailable(cb)',
      source: 'src/services/mobileService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:getOTAChannel',
      kind: 'function',
      module: 'admin',
      label: 'getOTAChannel',
      displayLabel: 'Get OTAChannel',
      description: 'Consulta get otachannel y entrega el resultado a la interfaz.',
      signature: 'getOTAChannel()',
      source: 'src/services/mobileService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:setOTAChannel',
      kind: 'function',
      module: 'admin',
      label: 'setOTAChannel',
      displayLabel: 'Set OTAChannel',
      description: 'Asigna este dispositivo a beta o vuelve al canal production.',
      signature: 'setOTAChannel(channel)',
      source: 'src/services/mobileService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:initOTAUpdates',
      kind: 'function',
      module: 'admin',
      label: 'initOTAUpdates',
      displayLabel: 'Init OTAUpdates',
      description: 'Ejecuta init otaupdates; participa en RPC sobre registrar_ota_aplicado.',
      signature: 'initOTAUpdates()',
      source: 'src/services/mobileService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'registrar_ota_aplicado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:versionOTA',
      kind: 'function',
      module: 'admin',
      label: 'versionOTA',
      displayLabel: 'Version OTA',
      description:
        '── Aplicar update manualmente (desde botón UI) ── Versión/canal OTA vigente en ESTE dispositivo (para mostrar en la app).',
      signature: 'versionOTA()',
      source: 'src/services/mobileService.js',
      operations: ['RPC', 'archivo'],
      resources: [{ kind: 'rpc', name: 'registrar_ota_aplicado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:buscarActualizacion',
      kind: 'function',
      module: 'admin',
      label: 'buscarActualizacion',
      displayLabel: 'Buscar Actualizacion',
      description:
        'Busca e instala una actualización OTA a demanda (botón "Buscar actualización").',
      signature: 'buscarActualizacion()',
      source: 'src/services/mobileService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:applyPendingUpdate',
      kind: 'function',
      module: 'admin',
      label: 'applyPendingUpdate',
      displayLabel: 'Apply Pending Update',
      description: 'Ejecuta apply pending update; participa en lógica de aplicación.',
      signature: 'applyPendingUpdate(bundleId)',
      source: 'src/services/mobileService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-mobileservice-js:initPushNotifications',
      kind: 'function',
      module: 'admin',
      label: 'initPushNotifications',
      displayLabel: 'Init Push Notifications',
      description: '── Push Notifications ──',
      signature: 'initPushNotifications(userId)',
      source: 'src/services/mobileService.js',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_usuarios' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-otadeployservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Ota Deploy Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/otaDeployService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:listarDespliegueOTA',
      kind: 'function',
      module: 'admin',
      label: 'listarDespliegueOTA',
      displayLabel: 'Listar Despliegue OTA',
      description:
        'Cliente OTA propio: Supabase administra canales/auditoría y GitHub Releases aloja bundles inmutables. No contiene claves privadas ni depende de Capgo. Lista bundles y la versión servida por cada canal.',
      signature: 'listarDespliegueOTA()',
      source: 'src/services/otaDeployService.js',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'ota-deploy' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:promoverOTA',
      kind: 'function',
      module: 'admin',
      label: 'promoverOTA',
      displayLabel: 'Promover OTA',
      description:
        'Promueve (enlaza) una versión ya existente al canal indicado (por defecto production = toda la bodega). No recompila; solo apunta el canal al bundle.',
      signature: "promoverOTA(version, channel = 'production')",
      source: 'src/services/otaDeployService.js',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'ota-deploy' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:eliminarBundleOTA',
      kind: 'function',
      module: 'admin',
      label: 'eliminarBundleOTA',
      displayLabel: 'Eliminar Bundle OTA',
      description: 'Archiva un bundle viejo. No toca canales activos ni borra evidencia histórica.',
      signature: 'eliminarBundleOTA(version)',
      source: 'src/services/otaDeployService.js',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'ota-deploy' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:obtenerGobernanzaOTA',
      kind: 'function',
      module: 'admin',
      label: 'obtenerGobernanzaOTA',
      displayLabel: 'Obtener Gobernanza OTA',
      description: '── Gobernanza de versión (versión mínima / obligatoria) ────────────────────',
      signature: 'obtenerGobernanzaOTA()',
      source: 'src/services/otaDeployService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_ota_gobernanza' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:guardarGobernanzaOTA',
      kind: 'function',
      module: 'admin',
      label: 'guardarGobernanzaOTA',
      displayLabel: 'Guardar Gobernanza OTA',
      description:
        'Registra guardar gobernanza ota sobre ota_gobernanza_set y devuelve el resultado de la operación.',
      signature: 'guardarGobernanzaOTA(p)',
      source: 'src/services/otaDeployService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'ota_gobernanza_set' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:resumenDispositivosOTA',
      kind: 'function',
      module: 'admin',
      label: 'resumenDispositivosOTA',
      displayLabel: 'Resumen Dispositivos OTA',
      description: '── Inventario: qué versión aplicó cada dispositivo (desde nuestro log) ──────',
      signature: 'resumenDispositivosOTA()',
      source: 'src/services/otaDeployService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:historialOTA',
      kind: 'function',
      module: 'admin',
      label: 'historialOTA',
      displayLabel: 'Historial OTA',
      description: '── Historial de despliegues (promociones / aplicados / eliminados) ──────────',
      signature: 'historialOTA()',
      source: 'src/services/otaDeployService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'ota_historial' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:avisarNuevaVersionPush',
      kind: 'function',
      module: 'admin',
      label: 'avisarNuevaVersionPush',
      displayLabel: 'Avisar Nueva Version Push',
      description: '── Aviso por push FCM de una nueva versión ──────────────────────────────────',
      signature: "avisarNuevaVersionPush(version, rol = 'ADMIN')",
      source: 'src/services/otaDeployService.js',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'notify-inventario' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-otadeployservice-js:limpiarBundlesViejos',
      kind: 'function',
      module: 'admin',
      label: 'limpiarBundlesViejos',
      displayLabel: 'Limpiar Bundles Viejos',
      description: '── Limpieza: elimina bundles viejos dejando los últimos N (respeta canales) ─',
      signature: 'limpiarBundlesViejos(bundles, canalVersiones, keep = 10)',
      source: 'src/services/otaDeployService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-panelptm-js',
      kind: 'service',
      module: 'panel',
      label: 'Panel Ptm',
      description: 'Capa de acceso y reglas reutilizables de Panel PTM.',
      source: 'src/services/panelPtm.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-panelptm-js:mapNvPanel',
      kind: 'function',
      module: 'panel',
      label: 'mapNvPanel',
      displayLabel: 'Map Nv Panel',
      description:
        'Normaliza la fila de operaciones a los campos que usa Calidad · Salida / Post-Venta.',
      signature: 'mapNvPanel(row)',
      source: 'src/services/panelPtm.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-panelptm-js:fetchNvPanel',
      kind: 'function',
      module: 'panel',
      label: 'fetchNvPanel',
      displayLabel: 'Fetch Nv Panel',
      description:
        'Busca una N.V (canal PTM) por número exacto en la operación viva. null si no existe.',
      signature: 'fetchNvPanel(nv)',
      source: 'src/services/panelPtm.js',
      operations: ['lectura'],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-postventaservice-js',
      kind: 'service',
      module: 'postventa',
      label: 'Postventa Service',
      description: 'Capa de acceso y reglas reutilizables de Post-Venta.',
      source: 'src/services/postventaService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      kind: 'function',
      module: 'postventa',
      label: 'pvSiguienteEstado',
      displayLabel: 'Pv Siguiente Estado',
      description: 'Ejecuta pv siguiente estado; participa en lógica de aplicación.',
      signature: 'pvSiguienteEstado(estado)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:pvEstadoCls',
      kind: 'function',
      module: 'postventa',
      label: 'pvEstadoCls',
      displayLabel: 'Pv Estado Cls',
      description: 'Ejecuta pv estado cls; participa en lógica de aplicación.',
      signature: 'pvEstadoCls(e)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:pvTipoCls',
      kind: 'function',
      module: 'postventa',
      label: 'pvTipoCls',
      displayLabel: 'Pv Tipo Cls',
      description: 'Ejecuta pv tipo cls; participa en lógica de aplicación.',
      signature: 'pvTipoCls(t)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:pvFolioCls',
      kind: 'function',
      module: 'postventa',
      label: 'pvFolioCls',
      displayLabel: 'Pv Folio Cls',
      description:
        'Color del chip del FOLIO: la serie CAL- (casos de Calidad) usa verde esmeralda; el resto hereda el color de su tipo de solicitud.',
      signature: 'pvFolioCls(t)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:pvPrioridadCls',
      kind: 'function',
      module: 'postventa',
      label: 'pvPrioridadCls',
      displayLabel: 'Pv Prioridad Cls',
      description: 'Ejecuta pv prioridad cls; participa en lógica de aplicación.',
      signature: 'pvPrioridadCls(p)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useTecnicos',
      kind: 'function',
      module: 'postventa',
      label: 'useTecnicos',
      displayLabel: 'Tecnicos',
      description:
        '============================================================================ Técnicos (catálogo editable, tabla tms_postventa_tecnicos) ============================================================================',
      signature: 'useTecnicos(soloActivos = false)',
      source: 'src/services/postventaService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_postventa_tecnicos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useGuardarTecnico',
      kind: 'function',
      module: 'postventa',
      label: 'useGuardarTecnico',
      displayLabel: 'Guardar Tecnico',
      description:
        'Consulta guardar tecnico sobre guardar_pv_tecnico y entrega el resultado a la interfaz.',
      signature: 'useGuardarTecnico()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_pv_tecnico' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useEliminarTecnico',
      kind: 'function',
      module: 'postventa',
      label: 'useEliminarTecnico',
      displayLabel: 'Eliminar Tecnico',
      description:
        'Consulta eliminar tecnico sobre eliminar_pv_tecnico y entrega el resultado a la interfaz.',
      signature: 'useEliminarTecnico()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_pv_tecnico' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useTickets',
      kind: 'function',
      module: 'postventa',
      label: 'useTickets',
      displayLabel: 'Tickets',
      description:
        '============================================================================ Tickets ============================================================================',
      signature: 'useTickets(filtros = {})',
      source: 'src/services/postventaService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_postventa_tickets' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useCrearTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useCrearTicket',
      displayLabel: 'Crear Ticket',
      description:
        'Consulta crear ticket sobre crear_pv_ticket y entrega el resultado a la interfaz.',
      signature: 'useCrearTicket()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'crear_pv_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useActualizarTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useActualizarTicket',
      displayLabel: 'Actualizar Ticket',
      description:
        'Consulta actualizar ticket sobre actualizar_pv_ticket y entrega el resultado a la interfaz.',
      signature: 'useActualizarTicket()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'actualizar_pv_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useEliminarTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useEliminarTicket',
      displayLabel: 'Eliminar Ticket',
      description: 'Eliminar un caso completo (descarta sus correos → no reingresan).',
      signature: 'useEliminarTicket()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_pv_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useEliminarCorreo',
      kind: 'function',
      module: 'postventa',
      label: 'useEliminarCorreo',
      displayLabel: 'Eliminar Correo',
      description: 'Eliminar un correo puntual del hilo (lo descarta → no reingresa).',
      signature: 'useEliminarCorreo()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_pv_correo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useReasociarCorreo',
      kind: 'function',
      module: 'postventa',
      label: 'useReasociarCorreo',
      displayLabel: 'Reasociar Correo',
      description: 'Reasociar un correo al ticket CORRECTO (mueve ticket_id/conversation_id).',
      signature: 'useReasociarCorreo()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'reasociar_pv_correo' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useAvanzarTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useAvanzarTicket',
      displayLabel: 'Avanzar Ticket',
      description: '── Flujo de estados + trazabilidad ─────────────────────────────────────────',
      signature: 'useAvanzarTicket()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'avanzar_pv_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useCerrarTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useCerrarTicket',
      displayLabel: 'Cerrar Ticket',
      description:
        'Consulta cerrar ticket sobre cerrar_pv_ticket y entrega el resultado a la interfaz.',
      signature: 'useCerrarTicket()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'cerrar_pv_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:usePvHistorial',
      kind: 'function',
      module: 'postventa',
      label: 'usePvHistorial',
      displayLabel: 'Pv Historial',
      description: 'Consulta pv historial sobre pv_historial y entrega el resultado a la interfaz.',
      signature: 'usePvHistorial(numero)',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'pv_historial' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:esCorreoInterno',
      kind: 'function',
      module: 'postventa',
      label: 'esCorreoInterno',
      displayLabel: 'Es Correo Interno',
      description: 'Ejecuta es correo interno; participa en lógica de aplicación.',
      signature: 'esCorreoInterno(email)',
      source: 'src/services/postventaService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useCorreosTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useCorreosTicket',
      displayLabel: 'Correos Ticket',
      description:
        'Consulta correos ticket sobre pv_correos_ticket y entrega el resultado a la interfaz.',
      signature: 'useCorreosTicket(numero)',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'pv_correos_ticket' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      kind: 'function',
      module: 'postventa',
      label: 'useInformeCalidadTicket',
      displayLabel: 'Informe Calidad Ticket',
      description:
        '============================================================================ Informe de Calidad adjunto a un ticket (visor para Servicio Técnico) ============================================================================',
      signature: 'useInformeCalidadTicket(numero, enabled = true)',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'pv_informe_calidad' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:useFamiliasStock',
      kind: 'function',
      module: 'postventa',
      label: 'useFamiliasStock',
      displayLabel: 'Familias Stock',
      description:
        '============================================================================ Familias de equipos (del stock de CCO: primeros 3 chars del código de producto) ============================================================================',
      signature: 'useFamiliasStock()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'pv_familias_stock' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-postventaservice-js:usePvDashboard',
      kind: 'function',
      module: 'postventa',
      label: 'usePvDashboard',
      displayLabel: 'Pv Dashboard',
      description:
        '============================================================================ Dashboard ============================================================================',
      signature: 'usePvDashboard()',
      source: 'src/services/postventaService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'pv_dashboard' }]
    },
    {
      status: 'activo',
      id: 'service:src-services-rendicionesservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Rendiciones Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/rendicionesService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-rendicionesservice-js:optimizePhoto',
      kind: 'function',
      module: 'admin',
      label: 'optimizePhoto',
      displayLabel: 'Optimize Photo',
      description: 'Ejecuta optimize photo; participa en lógica de aplicación.',
      signature: 'optimizePhoto(file)',
      source: 'src/services/rendicionesService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-securityservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Security Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/securityService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:estadoMFA',
      kind: 'function',
      module: 'admin',
      label: 'estadoMFA',
      displayLabel: 'Estado MFA',
      description: 'Estado MFA del usuario (desde el espejo servidor: enabled + factores).',
      signature: 'estadoMFA()',
      source: 'src/services/securityService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_mfa_estado' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:enrolarTOTP',
      kind: 'function',
      module: 'admin',
      label: 'enrolarTOTP',
      displayLabel: 'Enrolar TOTP',
      description:
        'Inicia el enrolamiento TOTP → devuelve { factorId, qr, secret, uri }. Antes de enrolar LIMPIA cualquier factor sin verificar (evita el error "A factor with the friendly name … already exists" cuando se abandonó un intento previo sin cancela',
      signature: "enrolarTOTP(friendlyName = 'CCO Authenticator')",
      source: 'src/services/securityService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:verificarTOTP',
      kind: 'function',
      module: 'admin',
      label: 'verificarTOTP',
      displayLabel: 'Verificar TOTP',
      description:
        'Verifica el código de 6 dígitos para completar el enrolamiento (o un challenge).',
      signature: 'verificarTOTP(factorId, code)',
      source: 'src/services/securityService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_mfa_sync' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:quitarFactor',
      kind: 'function',
      module: 'admin',
      label: 'quitarFactor',
      displayLabel: 'Quitar Factor',
      description: 'Quita un factor (desactiva MFA de ese autenticador).',
      signature: 'quitarFactor(factorId)',
      source: 'src/services/securityService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_mfa_sync' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:nivelAAL',
      kind: 'function',
      module: 'admin',
      label: 'nivelAAL',
      displayLabel: 'Nivel AAL',
      description: 'Nivel de aseguramiento actual/próximo (para el desafío en el login).',
      signature: 'nivelAAL()',
      source: 'src/services/securityService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-securityservice-js:factoresVerificados',
      kind: 'function',
      module: 'admin',
      label: 'factoresVerificados',
      displayLabel: 'Factores Verificados',
      description: 'Factores TOTP verificados (para elegir cuál desafiar en el login).',
      signature: 'factoresVerificados()',
      source: 'src/services/securityService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'service:src-services-tmsservice-js',
      kind: 'service',
      module: 'tms',
      label: 'Tms Service',
      description: 'Capa de acceso y reglas reutilizables de TMS Transporte.',
      source: 'src/services/tmsService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:listarOrdenes',
      kind: 'function',
      module: 'tms',
      label: 'listarOrdenes',
      displayLabel: 'Listar Ordenes',
      description:
        'Consulta listar ordenes sobre tms_transporte_ordenes y entrega el resultado a la interfaz.',
      signature: 'listarOrdenes()',
      source: 'src/services/tmsService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_transporte_ordenes' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:listarVehiculos',
      kind: 'function',
      module: 'tms',
      label: 'listarVehiculos',
      displayLabel: 'Listar Vehiculos',
      description:
        'Consulta listar vehiculos sobre tms_vehiculos y entrega el resultado a la interfaz.',
      signature: 'listarVehiculos()',
      source: 'src/services/tmsService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_vehiculos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:listarConductores',
      kind: 'function',
      module: 'tms',
      label: 'listarConductores',
      displayLabel: 'Listar Conductores',
      description:
        'Consulta listar conductores sobre tms_conductores y entrega el resultado a la interfaz.',
      signature: 'listarConductores()',
      source: 'src/services/tmsService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_conductores' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:listarIncidencias',
      kind: 'function',
      module: 'tms',
      label: 'listarIncidencias',
      displayLabel: 'Listar Incidencias',
      description:
        'Consulta listar incidencias sobre tms_transporte_incidencias y entrega el resultado a la interfaz.',
      signature: 'listarIncidencias(ordenId)',
      source: 'src/services/tmsService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_transporte_incidencias' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:crearOrdenDesdeNV',
      kind: 'function',
      module: 'tms',
      label: 'crearOrdenDesdeNV',
      displayLabel: 'Crear Orden Desde NV',
      description: 'Crea una orden desde una N.V.: busca la operación por número y llama la RPC.',
      signature: 'crearOrdenDesdeNV(nv)',
      source: 'src/services/tmsService.js',
      operations: ['lectura', 'RPC'],
      resources: [{ kind: 'rpc', name: 'tms_orden_crear_desde_nv' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:asignarOrden',
      kind: 'function',
      module: 'tms',
      label: 'asignarOrden',
      displayLabel: 'Asignar Orden',
      description:
        'Registra asignar orden sobre tms_orden_asignar y devuelve el resultado de la operación.',
      signature: 'asignarOrden(id, payload)',
      source: 'src/services/tmsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tms_orden_asignar' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:transicionOrden',
      kind: 'function',
      module: 'tms',
      label: 'transicionOrden',
      displayLabel: 'Transicion Orden',
      description: 'Ejecuta transicion orden; participa en RPC sobre tms_orden_transicion.',
      signature: 'transicionOrden(id, estado)',
      source: 'src/services/tmsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tms_orden_transicion' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:registrarPOD',
      kind: 'function',
      module: 'tms',
      label: 'registrarPOD',
      displayLabel: 'Registrar POD',
      description:
        'Registra registrar pod sobre tms_orden_pod y devuelve el resultado de la operación.',
      signature: 'registrarPOD(id, payload)',
      source: 'src/services/tmsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tms_orden_pod' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:crearIncidencia',
      kind: 'function',
      module: 'tms',
      label: 'crearIncidencia',
      displayLabel: 'Crear Incidencia',
      description:
        'Registra crear incidencia sobre tms_incidencia_crear y devuelve el resultado de la operación.',
      signature: 'crearIncidencia(ordenId, tipo, detalle)',
      source: 'src/services/tmsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tms_incidencia_crear' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:resolverIncidencia',
      kind: 'function',
      module: 'tms',
      label: 'resolverIncidencia',
      displayLabel: 'Resolver Incidencia',
      description:
        'Actualiza resolver incidencia sobre tms_incidencia_resolver aplicando las validaciones del servicio.',
      signature: 'resolverIncidencia(id, resolucion)',
      source: 'src/services/tmsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'tms_incidencia_resolver' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:subirEvidencia',
      kind: 'function',
      module: 'tms',
      label: 'subirEvidencia',
      displayLabel: 'Subir Evidencia',
      description: 'Sube un File/Blob y devuelve su path (para guardar en la orden).',
      signature: 'subirEvidencia(ordenId, tipo, fileOrBlob, ext)',
      source: 'src/services/tmsService.js',
      operations: ['archivo'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:urlEvidencia',
      kind: 'function',
      module: 'tms',
      label: 'urlEvidencia',
      displayLabel: 'Url Evidencia',
      description: 'URL firmada temporal para mostrar una evidencia.',
      signature: 'urlEvidencia(path, seg = 3600)',
      source: 'src/services/tmsService.js',
      operations: ['archivo'],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-tmsservice-js:miConductorId',
      kind: 'function',
      module: 'tms',
      label: 'miConductorId',
      displayLabel: 'Mi Conductor Id',
      description:
        'Id del conductor ligado al usuario actual (para "Mi Ruta"); null si no aplica. tms_conductores.user_id referencia tms_usuarios.id (no el auth_uid), así que se resuelve el puente auth.uid() → tms_usuarios.id → conductor.',
      signature: 'miConductorId()',
      source: 'src/services/tmsService.js',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_usuarios' },
        { kind: 'table', name: 'tms_conductores' }
      ]
    },
    {
      status: 'activo',
      id: 'service:src-services-workflowservice-js',
      kind: 'service',
      module: 'admin',
      label: 'Workflow Service',
      description: 'Capa de acceso y reglas reutilizables de Administración y plataforma.',
      source: 'src/services/workflowService.js'
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:listarDefiniciones',
      kind: 'function',
      module: 'admin',
      label: 'listarDefiniciones',
      displayLabel: 'Listar Definiciones',
      description:
        'Consulta listar definiciones sobre workflow_definition y entrega el resultado a la interfaz.',
      signature: 'listarDefiniciones()',
      source: 'src/services/workflowService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'workflow_definition' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:listarEstados',
      kind: 'function',
      module: 'admin',
      label: 'listarEstados',
      displayLabel: 'Listar Estados',
      description:
        'Consulta listar estados sobre workflow_state y entrega el resultado a la interfaz.',
      signature: 'listarEstados(workflow)',
      source: 'src/services/workflowService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'workflow_state' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:listarTransiciones',
      kind: 'function',
      module: 'admin',
      label: 'listarTransiciones',
      displayLabel: 'Listar Transiciones',
      description:
        'Consulta listar transiciones sobre workflow_transition y entrega el resultado a la interfaz.',
      signature: 'listarTransiciones(workflow)',
      source: 'src/services/workflowService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'workflow_transition' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:listarHistorial',
      kind: 'function',
      module: 'admin',
      label: 'listarHistorial',
      displayLabel: 'Listar Historial',
      description:
        'Consulta listar historial sobre workflow_history y entrega el resultado a la interfaz.',
      signature: 'listarHistorial(workflow, entidadId)',
      source: 'src/services/workflowService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'workflow_history' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:listarPermisos',
      kind: 'function',
      module: 'admin',
      label: 'listarPermisos',
      displayLabel: 'Listar Permisos',
      description: 'Catálogo de permisos (para el selector de la transición).',
      signature: 'listarPermisos()',
      source: 'src/services/workflowService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_permisos' }]
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:guardarDefinicion',
      kind: 'function',
      module: 'admin',
      label: 'guardarDefinicion',
      displayLabel: 'Guardar Definicion',
      description: 'Registra guardar definicion y devuelve el resultado de la operación.',
      signature: 'guardarDefinicion(p)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:eliminarDefinicion',
      kind: 'function',
      module: 'admin',
      label: 'eliminarDefinicion',
      displayLabel: 'Eliminar Definicion',
      description: 'Elimina o revoca eliminar definicion según las reglas de acceso.',
      signature: 'eliminarDefinicion(codigo)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:guardarEstado',
      kind: 'function',
      module: 'admin',
      label: 'guardarEstado',
      displayLabel: 'Guardar Estado',
      description: 'Registra guardar estado y devuelve el resultado de la operación.',
      signature: 'guardarEstado(p)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:eliminarEstado',
      kind: 'function',
      module: 'admin',
      label: 'eliminarEstado',
      displayLabel: 'Eliminar Estado',
      description: 'Elimina o revoca eliminar estado según las reglas de acceso.',
      signature: 'eliminarEstado(workflow, cod)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:guardarTransicion',
      kind: 'function',
      module: 'admin',
      label: 'guardarTransicion',
      displayLabel: 'Guardar Transicion',
      description: 'Registra guardar transicion y devuelve el resultado de la operación.',
      signature: 'guardarTransicion(p)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:eliminarTransicion',
      kind: 'function',
      module: 'admin',
      label: 'eliminarTransicion',
      displayLabel: 'Eliminar Transicion',
      description: 'Elimina o revoca eliminar transicion según las reglas de acceso.',
      signature: 'eliminarTransicion(id)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:transicionar',
      kind: 'function',
      module: 'admin',
      label: 'transicionar',
      displayLabel: 'Transicionar',
      description: 'Ejecuta transicionar; participa en lógica de aplicación.',
      signature: 'transicionar(workflow, entidadId, desde, accion, nota)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'function:src-services-workflowservice-js:accionesDisponibles',
      kind: 'function',
      module: 'admin',
      label: 'accionesDisponibles',
      displayLabel: 'Acciones Disponibles',
      description:
        'Acciones disponibles desde un estado, con flag `permitida` para el usuario en sesión (Fase 3 · Workflow Permissions → authz.can_transition). Devuelve [{ id, accion, hasta, hasta_etiqueta, permiso_id, permitida }].',
      signature: 'accionesDisponibles(workflow, desde)',
      source: 'src/services/workflowService.js',
      operations: [],
      resources: []
    },
    {
      status: 'activo',
      id: 'resource:table:tms-dashboard-layouts',
      kind: 'table',
      module: 'panel',
      label: 'tms_dashboard_layouts',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-dashboard',
      kind: 'rpc',
      module: 'panel',
      label: 'guardar_dashboard',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-dashboard',
      kind: 'rpc',
      module: 'panel',
      label: 'eliminar_dashboard',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-builder-calculated-fields',
      kind: 'table',
      module: 'panel',
      label: 'tms_builder_calculated_fields',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-campo-calculado',
      kind: 'rpc',
      module: 'panel',
      label: 'guardar_campo_calculado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-campo-calculado',
      kind: 'rpc',
      module: 'panel',
      label: 'eliminar_campo_calculado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-operaciones-log',
      kind: 'table',
      module: 'panel',
      label: 'tms_operaciones_log',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-panel-transportistas',
      kind: 'table',
      module: 'panel',
      label: 'tms_panel_transportistas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-nv-catalogo',
      kind: 'table',
      module: 'panel',
      label: 'tms_nv_catalogo',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-panel-vendedores',
      kind: 'table',
      module: 'panel',
      label: 'tms_panel_vendedores',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'guardar_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:iam-puede-editar-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'iam_puede_editar_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:iam-puede-cambiar-estado-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'iam_puede_cambiar_estado_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:cambiar-estado-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'cambiar_estado_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:corregir-estado-nv-a-shipping',
      kind: 'rpc',
      module: 'panel',
      label: 'corregir_estado_nv_a_shipping',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:gestionar-pausa-shipping-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'gestionar_pausa_shipping_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:reportar-incidencia-armado-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'reportar_incidencia_armado_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-nv-reaperturas',
      kind: 'table',
      module: 'panel',
      label: 'tms_nv_reaperturas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:solicitar-reapertura-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'solicitar_reapertura_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:resolver-reapertura-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'resolver_reapertura_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'eliminar_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-consolidados',
      kind: 'table',
      module: 'panel',
      label: 'tms_consolidados',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-consolidado-nvs',
      kind: 'table',
      module: 'panel',
      label: 'tms_consolidado_nvs',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-consolidado',
      kind: 'rpc',
      module: 'panel',
      label: 'guardar_consolidado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-consolidado',
      kind: 'rpc',
      module: 'panel',
      label: 'eliminar_consolidado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:listar-bandeja-reaperturas-nv',
      kind: 'rpc',
      module: 'panel',
      label: 'listar_bandeja_reaperturas_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:analisis-codigos-resumen',
      kind: 'rpc',
      module: 'inventario',
      label: 'analisis_codigos_resumen',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:analisis-codigos',
      kind: 'rpc',
      module: 'inventario',
      label: 'analisis_codigos',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-emil-sync',
      kind: 'table',
      module: 'inventario',
      label: 'tms_emil_sync',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:bulk-upsert',
      kind: 'rpc',
      module: 'inventario',
      label: 'bulk_upsert',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-inventario-general',
      kind: 'table',
      module: 'inventario',
      label: 'tms_inventario_general',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:api-keys-listar',
      kind: 'rpc',
      module: 'admin',
      label: 'api_keys_listar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:api-key-crear',
      kind: 'rpc',
      module: 'admin',
      label: 'api_key_crear',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:api-key-revocar',
      kind: 'rpc',
      module: 'admin',
      label: 'api_key_revocar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:api-log-listar',
      kind: 'rpc',
      module: 'admin',
      label: 'api_log_listar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-monitoreo-informes',
      kind: 'table',
      module: 'quality',
      label: 'tms_monitoreo_informes',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-monitoreo-items',
      kind: 'table',
      module: 'quality',
      label: 'tms_monitoreo_items',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:monitoreo-candidatos',
      kind: 'rpc',
      module: 'quality',
      label: 'monitoreo_candidatos',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:calidad-salida-candidatos',
      kind: 'rpc',
      module: 'quality',
      label: 'calidad_salida_candidatos',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:calidad-lotes-series',
      kind: 'rpc',
      module: 'quality',
      label: 'calidad_lotes_series',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:notify-inventario',
      kind: 'edge-function',
      module: 'admin',
      label: 'notify-inventario',
      description: 'Genera notificaciones ante eventos críticos de inventario.',
      source: 'supabase/functions/notify-inventario/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:monitoreo-marcar-preliminar',
      kind: 'rpc',
      module: 'quality',
      label: 'monitoreo_marcar_preliminar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:actualizar-informe-monitoreo',
      kind: 'rpc',
      module: 'quality',
      label: 'actualizar_informe_monitoreo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:monitoreo-next-numero',
      kind: 'rpc',
      module: 'quality',
      label: 'monitoreo_next_numero',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-monitoreo-evidencias',
      kind: 'table',
      module: 'quality',
      label: 'tms_monitoreo_evidencias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:monitoreo-dictaminar',
      kind: 'rpc',
      module: 'quality',
      label: 'monitoreo_dictaminar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:calidad-categorias-tarea',
      kind: 'rpc',
      module: 'quality',
      label: 'calidad_categorias_tarea',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:calidad-cargar-clasificacion',
      kind: 'rpc',
      module: 'quality',
      label: 'calidad_cargar_clasificacion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:calidad-reclasificar-recepciones',
      kind: 'rpc',
      module: 'quality',
      label: 'calidad_reclasificar_recepciones',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-calidad-tareas',
      kind: 'table',
      module: 'quality',
      label: 'tms_calidad_tareas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:firmar-certificado',
      kind: 'rpc',
      module: 'quality',
      label: 'firmar_certificado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:verificar-certificado',
      kind: 'rpc',
      module: 'quality',
      label: 'verificar_certificado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-calidad-asignaciones',
      kind: 'table',
      module: 'quality',
      label: 'tms_calidad_asignaciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'crear_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tomar-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'tomar_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-progreso-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'guardar_progreso_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:liberar-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'liberar_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:resolver-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'resolver_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:anular-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'anular_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-control-despacho',
      kind: 'table',
      module: 'quality',
      label: 'tms_control_despacho',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-tarea-salida',
      kind: 'rpc',
      module: 'quality',
      label: 'crear_tarea_salida',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-tarea-salida-manual',
      kind: 'rpc',
      module: 'quality',
      label: 'crear_tarea_salida_manual',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-tarea-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'eliminar_tarea_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-asignacion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'eliminar_asignacion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-bodegas-softland',
      kind: 'table',
      module: 'quality',
      label: 'tms_bodegas_softland',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-bodega-softland',
      kind: 'rpc',
      module: 'quality',
      label: 'guardar_bodega_softland',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-bodega-softland',
      kind: 'rpc',
      module: 'quality',
      label: 'eliminar_bodega_softland',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:trazabilidad-producto',
      kind: 'rpc',
      module: 'quality',
      label: 'trazabilidad_producto',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-areas-calidad',
      kind: 'table',
      module: 'quality',
      label: 'tms_areas_calidad',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-calidad-acciones',
      kind: 'table',
      module: 'quality',
      label: 'tms_calidad_acciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-accion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'crear_accion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:resolver-accion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'resolver_accion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:anular-accion-calidad',
      kind: 'rpc',
      module: 'quality',
      label: 'anular_accion_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:accion-a-ticket-pv',
      kind: 'rpc',
      module: 'quality',
      label: 'accion_a_ticket_pv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:accion-correo-enviado',
      kind: 'rpc',
      module: 'quality',
      label: 'accion_correo_enviado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:accion-registrar-referencia',
      kind: 'rpc',
      module: 'quality',
      label: 'accion_registrar_referencia',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-checklist-ingreso',
      kind: 'rpc',
      module: 'quality',
      label: 'guardar_checklist_ingreso',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:conteo-stock-sistema',
      kind: 'rpc',
      module: 'inventario',
      label: 'conteo_stock_sistema',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteo-sesiones',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteo_sesiones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-conteo-sesion',
      kind: 'rpc',
      module: 'inventario',
      label: 'crear_conteo_sesion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:cerrar-conteo-sesion',
      kind: 'rpc',
      module: 'inventario',
      label: 'cerrar_conteo_sesion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteos',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:registrar-conteo',
      kind: 'rpc',
      module: 'inventario',
      label: 'registrar_conteo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:editar-conteo',
      kind: 'rpc',
      module: 'inventario',
      label: 'editar_conteo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-conteo',
      kind: 'rpc',
      module: 'inventario',
      label: 'eliminar_conteo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:conteo-conciliacion',
      kind: 'rpc',
      module: 'inventario',
      label: 'conteo_conciliacion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:conteo-ajuste-erp',
      kind: 'rpc',
      module: 'inventario',
      label: 'conteo_ajuste_erp',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteo-bloques',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteo_bloques',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteo-bloque-items',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteo_bloque_items',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteo-auditorias',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteo_auditorias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-conteo-bloque',
      kind: 'rpc',
      module: 'inventario',
      label: 'crear_conteo_bloque',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:editar-conteo-bloque',
      kind: 'rpc',
      module: 'inventario',
      label: 'editar_conteo_bloque',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:agregar-conteo-bloque-item',
      kind: 'rpc',
      module: 'inventario',
      label: 'agregar_conteo_bloque_item',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-conteo-bloque-item',
      kind: 'rpc',
      module: 'inventario',
      label: 'eliminar_conteo_bloque_item',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:registrar-conteo-auditoria',
      kind: 'rpc',
      module: 'inventario',
      label: 'registrar_conteo_auditoria',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conteo-proyecciones',
      kind: 'table',
      module: 'inventario',
      label: 'tms_conteo_proyecciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-conteo-proyeccion',
      kind: 'rpc',
      module: 'inventario',
      label: 'guardar_conteo_proyeccion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-conteo-proyeccion',
      kind: 'rpc',
      module: 'inventario',
      label: 'eliminar_conteo_proyeccion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-conteo-costo',
      kind: 'rpc',
      module: 'inventario',
      label: 'guardar_conteo_costo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:dominio-eventos',
      kind: 'table',
      module: 'admin',
      label: 'dominio_eventos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:notificacion-regla',
      kind: 'table',
      module: 'admin',
      label: 'notificacion_regla',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:notificacion',
      kind: 'table',
      module: 'admin',
      label: 'notificacion',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:notif-marcar-enviadas',
      kind: 'rpc',
      module: 'admin',
      label: 'notif_marcar_enviadas',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-flujo-modelos',
      kind: 'table',
      module: 'admin',
      label: 'tms_flujo_modelos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:flujo-guardar',
      kind: 'rpc',
      module: 'admin',
      label: 'flujo_guardar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-insumos',
      kind: 'table',
      module: 'inventario',
      label: 'tms_insumos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:insumos-set-cantidad',
      kind: 'rpc',
      module: 'inventario',
      label: 'insumos_set_cantidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:insumos-guardar',
      kind: 'rpc',
      module: 'inventario',
      label: 'insumos_guardar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:insumos-eliminar',
      kind: 'rpc',
      module: 'inventario',
      label: 'insumos_eliminar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:registrar-ota-aplicado',
      kind: 'rpc',
      module: 'admin',
      label: 'registrar_ota_aplicado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-usuarios',
      kind: 'table',
      module: 'admin',
      label: 'tms_usuarios',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:ota-deploy',
      kind: 'edge-function',
      module: 'admin',
      label: 'ota-deploy',
      description: 'Función Edge ota-deploy.',
      source: 'supabase/functions/ota-deploy/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:table:tms-ota-gobernanza',
      kind: 'table',
      module: 'admin',
      label: 'tms_ota_gobernanza',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:ota-gobernanza-set',
      kind: 'rpc',
      module: 'admin',
      label: 'ota_gobernanza_set',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:ota-historial',
      kind: 'rpc',
      module: 'admin',
      label: 'ota_historial',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-postventa-tecnicos',
      kind: 'table',
      module: 'postventa',
      label: 'tms_postventa_tecnicos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-pv-tecnico',
      kind: 'rpc',
      module: 'postventa',
      label: 'guardar_pv_tecnico',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-pv-tecnico',
      kind: 'rpc',
      module: 'postventa',
      label: 'eliminar_pv_tecnico',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-postventa-tickets',
      kind: 'table',
      module: 'postventa',
      label: 'tms_postventa_tickets',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-pv-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'crear_pv_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:actualizar-pv-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'actualizar_pv_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-pv-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'eliminar_pv_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-pv-correo',
      kind: 'rpc',
      module: 'postventa',
      label: 'eliminar_pv_correo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:reasociar-pv-correo',
      kind: 'rpc',
      module: 'postventa',
      label: 'reasociar_pv_correo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:avanzar-pv-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'avanzar_pv_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:cerrar-pv-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'cerrar_pv_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:pv-historial',
      kind: 'rpc',
      module: 'postventa',
      label: 'pv_historial',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:pv-correos-ticket',
      kind: 'rpc',
      module: 'postventa',
      label: 'pv_correos_ticket',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:pv-informe-calidad',
      kind: 'rpc',
      module: 'postventa',
      label: 'pv_informe_calidad',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:pv-familias-stock',
      kind: 'rpc',
      module: 'postventa',
      label: 'pv_familias_stock',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:pv-dashboard',
      kind: 'rpc',
      module: 'postventa',
      label: 'pv_dashboard',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:iam-mfa-estado',
      kind: 'rpc',
      module: 'admin',
      label: 'iam_mfa_estado',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:iam-mfa-sync',
      kind: 'rpc',
      module: 'admin',
      label: 'iam_mfa_sync',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-transporte-ordenes',
      kind: 'table',
      module: 'tms',
      label: 'tms_transporte_ordenes',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-vehiculos',
      kind: 'table',
      module: 'tms',
      label: 'tms_vehiculos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-conductores',
      kind: 'table',
      module: 'tms',
      label: 'tms_conductores',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-transporte-incidencias',
      kind: 'table',
      module: 'tms',
      label: 'tms_transporte_incidencias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-orden-crear-desde-nv',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_orden_crear_desde_nv',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-orden-asignar',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_orden_asignar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-orden-transicion',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_orden_transicion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-orden-pod',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_orden_pod',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-incidencia-crear',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_incidencia_crear',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:tms-incidencia-resolver',
      kind: 'rpc',
      module: 'tms',
      label: 'tms_incidencia_resolver',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:workflow-definition',
      kind: 'table',
      module: 'admin',
      label: 'workflow_definition',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:workflow-state',
      kind: 'table',
      module: 'admin',
      label: 'workflow_state',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:workflow-transition',
      kind: 'table',
      module: 'admin',
      label: 'workflow_transition',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:workflow-history',
      kind: 'table',
      module: 'admin',
      label: 'workflow_history',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-permisos',
      kind: 'table',
      module: 'admin',
      label: 'tms_permisos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-auditoria-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Auditoria',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Auditoria.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-delegaciones-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Delegaciones',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Delegaciones.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-escala-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Escala',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Escala.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-historialacceso-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Historial Acceso',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/HistorialAcceso.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-politicas-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Politicas',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Politicas.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-scopes-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Scopes',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Scopes.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-sesiones-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Sesiones',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Sesiones.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-teams-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Teams',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Teams.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-users-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Users',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Users.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-inventory-bloquedetalle-jsx',
      kind: 'component',
      module: 'inventario',
      label: 'Bloque Detalle',
      description: 'Componente interno que participa en Inventario.',
      source: 'src/pages/Inventory/BloqueDetalle.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-mobile-conteopda-jsx',
      kind: 'component',
      module: 'inventario',
      label: 'Conteo PDA',
      description: 'Componente interno que participa en Inventario.',
      source: 'src/pages/Mobile/ConteoPDA.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Campos Calculados',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/builder/components/CamposCalculados.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Consolidados',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/ingresar/components/Consolidados.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-ingresar-components-formnv-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Form NV',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/ingresar/components/FormNV.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-reaperturas-bandejareaperturas-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Bandeja Reaperturas',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/reaperturas/BandejaReaperturas.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-public-rendicionpublica-jsx',
      kind: 'component',
      module: 'public',
      label: 'Rendicion Publica',
      description: 'Componente interno que participa en Acceso público.',
      source: 'src/pages/Public/RendicionPublica.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-quality-accionintegracion-jsx',
      kind: 'component',
      module: 'quality',
      label: 'Accion Integracion',
      description: 'Componente interno que participa en Calidad.',
      source: 'src/pages/Quality/AccionIntegracion.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-quality-asignacionescalidad-jsx',
      kind: 'component',
      module: 'quality',
      label: 'Asignaciones Calidad',
      description: 'Componente interno que participa en Calidad.',
      source: 'src/pages/Quality/AsignacionesCalidad.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-quality-checklistingreso-jsx',
      kind: 'component',
      module: 'quality',
      label: 'Checklist Ingreso',
      description: 'Componente interno que participa en Calidad.',
      source: 'src/pages/Quality/ChecklistIngreso.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-quality-salidacertificacion-jsx',
      kind: 'component',
      module: 'quality',
      label: 'Salida Certificacion',
      description: 'Componente interno que participa en Calidad.',
      source: 'src/pages/Quality/SalidaCertificacion.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-quality-trazabilidadmodal-jsx',
      kind: 'component',
      module: 'quality',
      label: 'Trazabilidad Modal',
      description: 'Componente interno que participa en Calidad.',
      source: 'src/pages/Quality/TrazabilidadModal.jsx'
    },
    {
      status: 'activo',
      id: 'component:src-pages-tms-podcapture-jsx',
      kind: 'component',
      module: 'tms',
      label: 'Pod Capture',
      description: 'Componente interno que participa en TMS Transporte.',
      source: 'src/pages/TMS/PodCapture.jsx'
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-adminmonitor-jsx:AdminMonitor',
      kind: 'action',
      module: 'admin',
      label: 'AdminMonitor',
      displayLabel: 'Admin Monitor',
      description: 'Ejecuta admin monitor; participa en lectura sobre tms_usuarios.',
      signature: 'AdminMonitor()',
      source: 'src/pages/Admin/AdminMonitor.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_usuarios' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-cleanup-jsx:handleCleanup',
      kind: 'action',
      module: 'admin',
      label: 'handleCleanup',
      displayLabel: 'Handle Cleanup',
      description: 'Ejecuta handle cleanup; participa en RPC sobre clean_operational_data.',
      signature: 'handleCleanup()',
      source: 'src/pages/Admin/Cleanup.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'clean_operational_data' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:clean-operational-data',
      kind: 'rpc',
      module: 'admin',
      label: 'clean_operational_data',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:AccessConfigPanel',
      kind: 'action',
      module: 'admin',
      label: 'AccessConfigPanel',
      displayLabel: 'Access Config Panel',
      description: '── PANEL ADMIN: Configuración de acceso por rol ──',
      signature: 'AccessConfigPanel({ onClose })',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_roles' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-roles',
      kind: 'table',
      module: 'admin',
      label: 'tms_roles',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:saveRole',
      kind: 'action',
      module: 'admin',
      label: 'saveRole',
      displayLabel: 'Save Role',
      description: 'Ejecuta save role; participa en actualización sobre tms_roles.',
      signature: 'saveRole(role)',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_roles' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:DataImport',
      kind: 'action',
      module: 'admin',
      label: 'DataImport',
      displayLabel: 'Data Import',
      description: '── COMPONENTE PRINCIPAL ──',
      signature: 'DataImport()',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_roles' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:normNvVal',
      kind: 'action',
      module: 'admin',
      label: 'normNvVal',
      displayLabel: 'Norm Nv Val',
      description: 'Ejecuta norm nv val; participa en lectura sobre tms_nv_catalogo.',
      signature: 'normNvVal(v)',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_nv_catalogo' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:hasVal',
      kind: 'action',
      module: 'admin',
      label: 'hasVal',
      displayLabel: 'Has Val',
      description:
        'Solo se conservan las filas que traen TODOS los campos obligatorios. (Antes era .some(): bastaba UN obligatorio no vacío, así que una fila con código pero SIN "producto" pasaba y luego reventaba el lote entero en el servidor por el not-null',
      signature: 'hasVal(v)',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_nv_eliminadas' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-nv-eliminadas',
      kind: 'table',
      module: 'admin',
      label: 'tms_nv_eliminadas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:enrichWithProductInfo',
      kind: 'action',
      module: 'admin',
      label: 'enrichWithProductInfo',
      displayLabel: 'Enrich With Product Info',
      description:
        'Ejecuta enrich with product info; participa en lectura sobre tms_matriz_codigos.',
      signature: 'enrichWithProductInfo(code)',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_matriz_codigos' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-matriz-codigos',
      kind: 'table',
      module: 'admin',
      label: 'tms_matriz_codigos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:handleUpload',
      kind: 'action',
      module: 'admin',
      label: 'handleUpload',
      displayLabel: 'Handle Upload',
      description:
        'Ejecuta handle upload; participa en RPC sobre nv_catalogo_purgar_canal, prepare_nv_import.',
      signature: 'handleUpload()',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['RPC'],
      resources: [
        { kind: 'rpc', name: 'nv_catalogo_purgar_canal' },
        { kind: 'rpc', name: 'prepare_nv_import' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:nv-catalogo-purgar-canal',
      kind: 'rpc',
      module: 'admin',
      label: 'nv_catalogo_purgar_canal',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:prepare-nv-import',
      kind: 'rpc',
      module: 'admin',
      label: 'prepare_nv_import',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-dataimport-jsx:runChunk',
      kind: 'action',
      module: 'admin',
      label: 'runChunk',
      displayLabel: 'Run Chunk',
      description: 'Procesa un lote con abort/timeout y actualiza progreso al terminar.',
      signature: 'runChunk(chunk, chunkNum)',
      source: 'src/pages/Admin/DataImport.jsx',
      operations: ['creación', 'RPC'],
      resources: [
        { kind: 'rpc', name: 'bulk_upsert' },
        { kind: 'table', name: 'tms_historial_cargas' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-historial-cargas',
      kind: 'table',
      module: 'admin',
      label: 'tms_historial_cargas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationmanager-jsx:LocationManager',
      kind: 'action',
      module: 'admin',
      label: 'LocationManager',
      displayLabel: 'Location Manager',
      description: '─── Main Component ──────────────────────────────────',
      signature: 'LocationManager()',
      source: 'src/pages/Admin/LocationManager.jsx',
      operations: ['lectura', 'RPC', 'Realtime'],
      resources: [{ kind: 'rpc', name: 'putaway_admin_resumen' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:putaway-admin-resumen',
      kind: 'rpc',
      module: 'admin',
      label: 'putaway_admin_resumen',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationmanager-jsx:handleInlineSave',
      kind: 'action',
      module: 'admin',
      label: 'handleInlineSave',
      displayLabel: 'Handle Inline Save',
      description: '─── Actions ────────────────────────────────────────',
      signature: 'handleInlineSave(rowId, field, value)',
      source: 'src/pages/Admin/LocationManager.jsx',
      operations: ['lectura', 'actualización', 'RPC'],
      resources: [{ kind: 'rpc', name: 'mover_ubicacion_wms' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:mover-ubicacion-wms',
      kind: 'rpc',
      module: 'admin',
      label: 'mover_ubicacion_wms',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationmanager-jsx:handleMove',
      kind: 'action',
      module: 'admin',
      label: 'handleMove',
      displayLabel: 'Handle Move',
      description: 'Ejecuta handle move; participa en RPC sobre mover_ubicacion_wms.',
      signature: 'handleMove(item, newUbicacion)',
      source: 'src/pages/Admin/LocationManager.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'mover_ubicacion_wms' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationmanager-jsx:handleDelete',
      kind: 'action',
      module: 'admin',
      label: 'handleDelete',
      displayLabel: 'Handle Delete',
      description: 'Ejecuta handle delete; participa en RPC sobre eliminar_ubicacion_wms.',
      signature: 'handleDelete(item)',
      source: 'src/pages/Admin/LocationManager.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_ubicacion_wms' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-ubicacion-wms',
      kind: 'rpc',
      module: 'admin',
      label: 'eliminar_ubicacion_wms',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationrequests-jsx:submit',
      kind: 'action',
      module: 'admin',
      label: 'submit',
      displayLabel: 'Submit',
      description: 'Ejecuta submit; participa en RPC sobre resolver_cambio_ubicacion.',
      signature: 'submit()',
      source: 'src/pages/Admin/LocationRequests.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_cambio_ubicacion' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:resolver-cambio-ubicacion',
      kind: 'rpc',
      module: 'admin',
      label: 'resolver_cambio_ubicacion',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-locationrequests-jsx:LocationRequests',
      kind: 'action',
      module: 'admin',
      label: 'LocationRequests',
      displayLabel: 'Location Requests',
      description:
        'Ejecuta location requests; participa en lectura, Realtime sobre wms_ubicacion_solicitudes.',
      signature: 'LocationRequests()',
      source: 'src/pages/Admin/LocationRequests.jsx',
      operations: ['lectura', 'Realtime'],
      resources: [{ kind: 'table', name: 'wms_ubicacion_solicitudes' }]
    },
    {
      status: 'activo',
      id: 'resource:table:wms-ubicacion-solicitudes',
      kind: 'table',
      module: 'admin',
      label: 'wms_ubicacion_solicitudes',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-observability-jsx:fetchObservabilitySnapshot',
      kind: 'action',
      module: 'admin',
      label: 'fetchObservabilitySnapshot',
      displayLabel: 'Fetch Observability Snapshot',
      description:
        'Consulta fetch observability snapshot sobre system_logs, system_alerts y entrega el resultado a la interfaz.',
      signature:
        'fetchObservabilitySnapshot({ lookback, level, kind, moduleFilter, search, alertStatus })',
      source: 'src/pages/Admin/Observability.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'system_logs' },
        { kind: 'table', name: 'system_alerts' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:system-logs',
      kind: 'table',
      module: 'admin',
      label: 'system_logs',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:system-alerts',
      kind: 'table',
      module: 'admin',
      label: 'system_alerts',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-observability-jsx:Observability',
      kind: 'action',
      module: 'admin',
      label: 'Observability',
      displayLabel: 'Observability',
      description:
        'Ejecuta observability; participa en RPC sobre update_system_alert_status, force_app_refresh.',
      signature: 'Observability()',
      source: 'src/pages/Admin/Observability.jsx',
      operations: ['RPC'],
      resources: [
        { kind: 'rpc', name: 'update_system_alert_status' },
        { kind: 'rpc', name: 'force_app_refresh' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:update-system-alert-status',
      kind: 'rpc',
      module: 'admin',
      label: 'update_system_alert_status',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:force-app-refresh',
      kind: 'rpc',
      module: 'admin',
      label: 'force_app_refresh',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-roles-jsx:RolesPage',
      kind: 'action',
      module: 'admin',
      label: 'RolesPage',
      displayLabel: 'Roles Page',
      description:
        'Ejecuta roles page; participa en lectura, upsert, eliminación sobre tms_roles, tms_usuarios.',
      signature: 'RolesPage({ embedded = false })',
      source: 'src/pages/Admin/Roles.jsx',
      operations: ['lectura', 'upsert', 'eliminación'],
      resources: [
        { kind: 'table', name: 'tms_roles' },
        { kind: 'table', name: 'tms_usuarios' }
      ]
    },
    {
      status: 'activo',
      id: 'component:src-pages-admin-roles-jsx',
      kind: 'component',
      module: 'admin',
      label: 'Roles',
      description: 'Componente interno que participa en Administración y plataforma.',
      source: 'src/pages/Admin/Roles.jsx'
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:Tickets',
      kind: 'action',
      module: 'admin',
      label: 'Tickets',
      displayLabel: 'Tickets',
      description:
        '═══════════════════════════════════════════════════════ ─── MAIN COMPONENT ────────────────────────────────── ═══════════════════════════════════════════════════════',
      signature: 'Tickets()',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      kind: 'action',
      module: 'admin',
      label: 'fetchTickets',
      displayLabel: 'Fetch Tickets',
      description: 'Consulta fetch tickets sobre tms_tickets y entrega el resultado a la interfaz.',
      signature: 'fetchTickets()',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_tickets' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-tickets',
      kind: 'table',
      module: 'admin',
      label: 'tms_tickets',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:handleStatusChange',
      kind: 'action',
      module: 'admin',
      label: 'handleStatusChange',
      displayLabel: 'Handle Status Change',
      description: '─── Actions ────────────────────────────────────────',
      signature: 'handleStatusChange(id, newStatus)',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_tickets' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:handleRespond',
      kind: 'action',
      module: 'admin',
      label: 'handleRespond',
      displayLabel: 'Handle Respond',
      description: 'Ejecuta handle respond; participa en actualización sobre tms_tickets.',
      signature: 'handleRespond(id, respuesta)',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_tickets' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:handleCreate',
      kind: 'action',
      module: 'admin',
      label: 'handleCreate',
      displayLabel: 'Handle Create',
      description: 'Ejecuta handle create; participa en creación sobre tms_tickets.',
      signature: 'handleCreate(form)',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['creación'],
      resources: [{ kind: 'table', name: 'tms_tickets' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-tickets-jsx:handleDelete',
      kind: 'action',
      module: 'admin',
      label: 'handleDelete',
      displayLabel: 'Handle Delete',
      description: 'Ejecuta handle delete; participa en eliminación sobre tms_tickets.',
      signature: 'handleDelete(id)',
      source: 'src/pages/Admin/Tickets.jsx',
      operations: ['eliminación'],
      resources: [{ kind: 'table', name: 'tms_tickets' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-uploadhistory-jsx:UploadHistory',
      kind: 'action',
      module: 'admin',
      label: 'UploadHistory',
      displayLabel: 'Upload History',
      description:
        '═══════════════════════════════════════════════════════ ─── MAIN COMPONENT ────────────────────────────────── ═══════════════════════════════════════════════════════',
      signature: 'UploadHistory()',
      source: 'src/pages/Admin/UploadHistory.jsx',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-uploadhistory-jsx:fetchHistory',
      kind: 'action',
      module: 'admin',
      label: 'fetchHistory',
      displayLabel: 'Fetch History',
      description:
        'Consulta fetch history sobre tms_historial_cargas y entrega el resultado a la interfaz.',
      signature: 'fetchHistory()',
      source: 'src/pages/Admin/UploadHistory.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_historial_cargas' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-users-jsx:UsersPage',
      kind: 'action',
      module: 'admin',
      label: 'UsersPage',
      displayLabel: 'Users Page',
      description:
        'Consulta users page sobre tms_roles, tms_usuarios y entrega el resultado a la interfaz.',
      signature: 'UsersPage({ embedded = false })',
      source: 'src/pages/Admin/Users.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_roles' },
        { kind: 'table', name: 'tms_usuarios' }
      ]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-users-jsx:debounced',
      kind: 'action',
      module: 'admin',
      label: 'debounced',
      displayLabel: 'Debounced',
      description:
        'Ejecuta debounced; participa en RPC, Realtime sobre guardar_usuario, eliminar_usuario_completo, usuarios_bulk.',
      signature: 'debounced(key)',
      source: 'src/pages/Admin/Users.jsx',
      operations: ['RPC', 'Realtime'],
      resources: [
        { kind: 'rpc', name: 'guardar_usuario' },
        { kind: 'rpc', name: 'eliminar_usuario_completo' },
        { kind: 'rpc', name: 'usuarios_bulk' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-usuario',
      kind: 'rpc',
      module: 'admin',
      label: 'guardar_usuario',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-usuario-completo',
      kind: 'rpc',
      module: 'admin',
      label: 'eliminar_usuario_completo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:usuarios-bulk',
      kind: 'rpc',
      module: 'admin',
      label: 'usuarios_bulk',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-views-jsx:fetchData',
      kind: 'action',
      module: 'admin',
      label: 'fetchData',
      displayLabel: 'Fetch Data',
      description:
        'Consulta fetch data sobre tms_modules_config, tms_roles y entrega el resultado a la interfaz.',
      signature: 'fetchData()',
      source: 'src/pages/Admin/Views.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_modules_config' },
        { kind: 'table', name: 'tms_roles' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-modules-config',
      kind: 'table',
      module: 'admin',
      label: 'tms_modules_config',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-views-jsx:handleToggleModule',
      kind: 'action',
      module: 'admin',
      label: 'handleToggleModule',
      displayLabel: 'Handle Toggle Module',
      description: '⭐ Cambiar estado de módulo y actualizar menú instantáneamente',
      signature: 'handleToggleModule(id, currentStatus)',
      source: 'src/pages/Admin/Views.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_modules_config' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-admin-views-jsx:handleUpdateLandingPage',
      kind: 'action',
      module: 'admin',
      label: 'handleUpdateLandingPage',
      displayLabel: 'Handle Update Landing Page',
      description:
        'Ejecuta handle update landing page; participa en actualización sobre tms_roles.',
      signature: 'handleUpdateLandingPage(roleId, newPath)',
      source: 'src/pages/Admin/Views.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_roles' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-cubingregistry-jsx:CubingRegistry',
      kind: 'action',
      module: 'inbound',
      label: 'CubingRegistry',
      displayLabel: 'Cubing Registry',
      description:
        'Ejecuta cubing registry; participa en lógica de aplicación sobre .anim-stagger.',
      signature: 'CubingRegistry()',
      source: 'src/pages/Inbound/CubingRegistry.jsx',
      operations: [],
      resources: [{ kind: 'table', name: '.anim-stagger' }]
    },
    {
      status: 'activo',
      id: 'resource:table:anim-stagger',
      kind: 'table',
      module: 'inbound',
      label: '.anim-stagger',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-cubingregistry-jsx:fetchProduct',
      kind: 'action',
      module: 'inbound',
      label: 'fetchProduct',
      displayLabel: 'Fetch Product',
      description:
        'Consulta fetch product sobre tms_matriz_codigos, tms_pesos y entrega el resultado a la interfaz.',
      signature: 'fetchProduct()',
      source: 'src/pages/Inbound/CubingRegistry.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_matriz_codigos' },
        { kind: 'table', name: 'tms_pesos' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-pesos',
      kind: 'table',
      module: 'inbound',
      label: 'tms_pesos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-cubingregistry-jsx:handleInputChange',
      kind: 'action',
      module: 'inbound',
      label: 'handleInputChange',
      displayLabel: 'Handle Input Change',
      description:
        'Ejecuta handle input change; participa en creación, upsert sobre tms_pesos, tms_cubicaje_historial.',
      signature: 'handleInputChange(e)',
      source: 'src/pages/Inbound/CubingRegistry.jsx',
      operations: ['creación', 'upsert'],
      resources: [
        { kind: 'table', name: 'tms_pesos' },
        { kind: 'table', name: 'tms_cubicaje_historial' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-cubicaje-historial',
      kind: 'table',
      module: 'inbound',
      label: 'tms_cubicaje_historial',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-entry-jsx:goOffline',
      kind: 'action',
      module: 'inbound',
      label: 'goOffline',
      displayLabel: 'Go Offline',
      description:
        'Ejecuta go offline; participa en lectura sobre tms_matriz_codigos, wms_ubicaciones.',
      signature: 'goOffline()',
      source: 'src/pages/Inbound/Entry.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_matriz_codigos' },
        { kind: 'table', name: 'wms_ubicaciones' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:wms-ubicaciones',
      kind: 'table',
      module: 'inbound',
      label: 'wms_ubicaciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-entry-jsx:handleUbicacionBlur',
      kind: 'action',
      module: 'inbound',
      label: 'handleUbicacionBlur',
      displayLabel: 'Handle Ubicacion Blur',
      description: 'Validate ubicacion exists on blur',
      signature: 'handleUbicacionBlur()',
      source: 'src/pages/Inbound/Entry.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'wms_ubicaciones' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-entry-jsx:buildVisualLocationRows',
      kind: 'action',
      module: 'inbound',
      label: 'buildVisualLocationRows',
      displayLabel: 'Build Visual Location Rows',
      description:
        'Ejecuta build visual location rows; participa en creación, RPC sobre registrar_putaway_ubicaciones, tms_historial_cargas.',
      signature: 'buildVisualLocationRows(items)',
      source: 'src/pages/Inbound/Entry.jsx',
      operations: ['creación', 'RPC'],
      resources: [
        { kind: 'rpc', name: 'registrar_putaway_ubicaciones' },
        { kind: 'table', name: 'tms_historial_cargas' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:registrar-putaway-ubicaciones',
      kind: 'rpc',
      module: 'inbound',
      label: 'registrar_putaway_ubicaciones',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-reception-jsx:insertRecepcionItemsInChunks',
      kind: 'action',
      module: 'inbound',
      label: 'insertRecepcionItemsInChunks',
      displayLabel: 'Insert Recepcion Items In Chunks',
      description:
        'Ejecuta insert recepcion items in chunks; participa en creación sobre tms_recepcion_items.',
      signature: 'insertRecepcionItemsInChunks(items, recepcionId)',
      source: 'src/pages/Inbound/Reception.jsx',
      operations: ['creación'],
      resources: [{ kind: 'table', name: 'tms_recepcion_items' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-recepcion-items',
      kind: 'table',
      module: 'inbound',
      label: 'tms_recepcion_items',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-reception-jsx:fetchRecepcionItemsAll',
      kind: 'action',
      module: 'inbound',
      label: 'fetchRecepcionItemsAll',
      displayLabel: 'Fetch Recepcion Items All',
      description:
        'Consulta fetch recepcion items all sobre tms_recepcion_items y entrega el resultado a la interfaz.',
      signature: 'fetchRecepcionItemsAll(recepcionId)',
      source: 'src/pages/Inbound/Reception.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_recepcion_items' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-reception-jsx:normSerie',
      kind: 'action',
      module: 'inbound',
      label: 'normSerie',
      displayLabel: 'Norm Serie',
      description:
        'Detección de series duplicadas (una serie no debería repetirse en la recepción).',
      signature: 'normSerie(s)',
      source: 'src/pages/Inbound/Reception.jsx',
      operations: ['lectura', 'creación', 'actualización', 'eliminación'],
      resources: [
        { kind: 'table', name: 'tms_recepciones' },
        { kind: 'table', name: 'tms_recepcion_items' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-recepciones',
      kind: 'table',
      module: 'inbound',
      label: 'tms_recepciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-reception-jsx:deleteRecepcion',
      kind: 'action',
      module: 'inbound',
      label: 'deleteRecepcion',
      displayLabel: 'Delete Recepcion',
      description: 'Eliminar recepción completa',
      signature: 'deleteRecepcion(id, proveedor)',
      source: 'src/pages/Inbound/Reception.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_recepcion_completa' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-recepcion-completa',
      kind: 'rpc',
      module: 'inbound',
      label: 'eliminar_recepcion_completa',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-reception-jsx:lookupDescription',
      kind: 'action',
      module: 'inbound',
      label: 'lookupDescription',
      displayLabel: 'Lookup Description',
      description: 'Ejecuta lookup description; participa en lectura sobre tms_matriz_codigos.',
      signature: 'lookupDescription(codigo)',
      source: 'src/pages/Inbound/Reception.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_matriz_codigos' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-receptionnacional-jsx:insertRecepcionItemsNacionalesInChunks',
      kind: 'action',
      module: 'inbound',
      label: 'insertRecepcionItemsNacionalesInChunks',
      displayLabel: 'Insert Recepcion Items Nacionales In Chunks',
      description:
        'Ejecuta insert recepcion items nacionales in chunks; participa en creación sobre tms_recepcion_items_nacionales.',
      signature: 'insertRecepcionItemsNacionalesInChunks(items, recepcionId)',
      source: 'src/pages/Inbound/ReceptionNacional.jsx',
      operations: ['creación'],
      resources: [{ kind: 'table', name: 'tms_recepcion_items_nacionales' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-recepcion-items-nacionales',
      kind: 'table',
      module: 'inbound',
      label: 'tms_recepcion_items_nacionales',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-receptionnacional-jsx:fetchRecepcionItemsNacionalesAll',
      kind: 'action',
      module: 'inbound',
      label: 'fetchRecepcionItemsNacionalesAll',
      displayLabel: 'Fetch Recepcion Items Nacionales All',
      description:
        'Consulta fetch recepcion items nacionales all sobre tms_recepcion_items_nacionales y entrega el resultado a la interfaz.',
      signature: 'fetchRecepcionItemsNacionalesAll(recepcionId)',
      source: 'src/pages/Inbound/ReceptionNacional.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_recepcion_items_nacionales' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-receptionnacional-jsx:normSerie',
      kind: 'action',
      module: 'inbound',
      label: 'normSerie',
      displayLabel: 'Norm Serie',
      description:
        'Detección de series duplicadas (una serie no debería repetirse en la recepción).',
      signature: 'normSerie(s)',
      source: 'src/pages/Inbound/ReceptionNacional.jsx',
      operations: ['lectura', 'creación', 'actualización', 'eliminación'],
      resources: [
        { kind: 'table', name: 'tms_recepciones_nacionales' },
        { kind: 'table', name: 'tms_recepcion_items_nacionales' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-recepciones-nacionales',
      kind: 'table',
      module: 'inbound',
      label: 'tms_recepciones_nacionales',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-receptionnacional-jsx:deleteRecepcion',
      kind: 'action',
      module: 'inbound',
      label: 'deleteRecepcion',
      displayLabel: 'Delete Recepcion',
      description: 'Eliminar recepción completa',
      signature: 'deleteRecepcion(id, proveedor)',
      source: 'src/pages/Inbound/ReceptionNacional.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_recepcion_completa' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inbound-receptionnacional-jsx:lookupDescription',
      kind: 'action',
      module: 'inbound',
      label: 'lookupDescription',
      displayLabel: 'Lookup Description',
      description: 'Ejecuta lookup description; participa en lectura sobre tms_matriz_codigos.',
      signature: 'lookupDescription(codigo)',
      source: 'src/pages/Inbound/ReceptionNacional.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_matriz_codigos' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-inventory-carteles-jsx:Carteles',
      kind: 'action',
      module: 'inventario',
      label: 'Carteles',
      displayLabel: 'Carteles',
      description: 'Ejecuta carteles; participa en lectura sobre tms_matriz_codigos.',
      signature: 'Carteles()',
      source: 'src/pages/Inventory/Carteles.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_matriz_codigos' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-mobile-consultapda-jsx:buscar',
      kind: 'action',
      module: 'inventario',
      label: 'buscar',
      displayLabel: 'Buscar',
      description: 'Consulta buscar sobre wms_ubicaciones y entrega el resultado a la interfaz.',
      signature: 'buscar(termRaw)',
      source: 'src/pages/Mobile/ConsultaPDA.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'wms_ubicaciones' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-mobile-consultapda-jsx',
      kind: 'component',
      module: 'inventario',
      label: 'Consulta PDA',
      description: 'Componente interno que participa en Inventario.',
      source: 'src/pages/Mobile/ConsultaPDA.jsx'
    },
    {
      status: 'activo',
      id: 'action:src-pages-mobile-warehousepda-jsx:processPutawayInput',
      kind: 'action',
      module: 'inventario',
      label: 'processPutawayInput',
      displayLabel: 'Process Putaway Input',
      description: '==================== PUTAWAY ====================',
      signature: 'processPutawayInput(val)',
      source: 'src/pages/Mobile/WarehousePDA.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'wms_ubicaciones' },
        { kind: 'table', name: 'tms_matriz_codigos' }
      ]
    },
    {
      status: 'activo',
      id: 'action:src-pages-mobile-warehousepda-jsx:encolar',
      kind: 'action',
      module: 'inventario',
      label: 'encolar',
      displayLabel: 'Encolar',
      description: 'Guarda la operación en la cola local para subirla al reconectar.',
      signature: 'encolar()',
      source: 'src/pages/Mobile/WarehousePDA.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'registrar_putaway_ubicaciones' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:fetchDashboards',
      kind: 'action',
      module: 'panel',
      label: 'fetchDashboards',
      displayLabel: 'Fetch Dashboards',
      description:
        'Consulta fetch dashboards sobre tms_dashboard_layouts y entrega el resultado a la interfaz.',
      signature: 'fetchDashboards()',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_dashboard_layouts' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-builder-builderservice-js',
      kind: 'component',
      module: 'panel',
      label: 'Builder Service',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/builder/builderService.js'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:saveDashboard',
      kind: 'action',
      module: 'panel',
      label: 'saveDashboard',
      displayLabel: 'Save Dashboard',
      description: 'Ejecuta save dashboard; participa en RPC sobre guardar_dashboard.',
      signature: 'saveDashboard(d)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_dashboard' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:deleteDashboard',
      kind: 'action',
      module: 'panel',
      label: 'deleteDashboard',
      displayLabel: 'Delete Dashboard',
      description: 'Ejecuta delete dashboard; participa en RPC sobre eliminar_dashboard.',
      signature: 'deleteDashboard(id)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_dashboard' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      kind: 'action',
      module: 'panel',
      label: 'fetchCalculatedFields',
      displayLabel: 'Fetch Calculated Fields',
      description:
        'Consulta fetch calculated fields sobre tms_builder_calculated_fields y entrega el resultado a la interfaz.',
      signature: 'fetchCalculatedFields(incluirInactivos = false)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_builder_calculated_fields' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      kind: 'action',
      module: 'panel',
      label: 'saveCalculatedField',
      displayLabel: 'Save Calculated Field',
      description: 'Ejecuta save calculated field; participa en RPC sobre guardar_campo_calculado.',
      signature: 'saveCalculatedField(f)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_campo_calculado' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      kind: 'action',
      module: 'panel',
      label: 'deleteCalculatedField',
      displayLabel: 'Delete Calculated Field',
      description:
        'Ejecuta delete calculated field; participa en RPC sobre eliminar_campo_calculado.',
      signature: 'deleteCalculatedField(id)',
      source: 'src/pages/Panel/builder/builderService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_campo_calculado' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-config-configservice-js:guardarCatalogo',
      kind: 'action',
      module: 'panel',
      label: 'guardarCatalogo',
      displayLabel: 'Guardar Catalogo',
      description:
        'Registra guardar catalogo sobre guardar_panel_catalogo y devuelve el resultado de la operación.',
      signature: 'guardarCatalogo(tipo, form)',
      source: 'src/pages/Panel/config/configService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_panel_catalogo' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-config-configservice-js',
      kind: 'component',
      module: 'panel',
      label: 'Config Service',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/config/configService.js'
    },
    {
      status: 'activo',
      id: 'resource:rpc:guardar-panel-catalogo',
      kind: 'rpc',
      module: 'panel',
      label: 'guardar_panel_catalogo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-config-configservice-js:toggleCatalogo',
      kind: 'action',
      module: 'panel',
      label: 'toggleCatalogo',
      displayLabel: 'Toggle Catalogo',
      description:
        'Actualiza toggle catalogo sobre toggle_panel_catalogo aplicando las validaciones del servicio.',
      signature: 'toggleCatalogo(tipo, id, activo)',
      source: 'src/pages/Panel/config/configService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'toggle_panel_catalogo' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:toggle-panel-catalogo',
      kind: 'rpc',
      module: 'panel',
      label: 'toggle_panel_catalogo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-config-configservice-js:eliminarCatalogo',
      kind: 'action',
      module: 'panel',
      label: 'eliminarCatalogo',
      displayLabel: 'Eliminar Catalogo',
      description:
        'Elimina o revoca eliminar catalogo sobre eliminar_panel_catalogo según las reglas de acceso.',
      signature: 'eliminarCatalogo(tipo, id)',
      source: 'src/pages/Panel/config/configService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_panel_catalogo' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:eliminar-panel-catalogo',
      kind: 'rpc',
      module: 'panel',
      label: 'eliminar_panel_catalogo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-config-configservice-js:fetchAuditoria',
      kind: 'action',
      module: 'panel',
      label: 'fetchAuditoria',
      displayLabel: 'Fetch Auditoria',
      description:
        'Consulta fetch auditoria sobre tms_operaciones_log y entrega el resultado a la interfaz.',
      signature: "fetchAuditoria({ operador = '', accion = '', nv = '', limit = 150 } = {})",
      source: 'src/pages/Panel/config/configService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_operaciones_log' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      kind: 'action',
      module: 'panel',
      label: 'fetchAuditStatsPanel',
      displayLabel: 'Fetch Audit Stats Panel',
      description:
        'Consulta fetch audit stats panel sobre tms_operaciones_log y entrega el resultado a la interfaz.',
      signature: 'fetchAuditStatsPanel()',
      source: 'src/pages/Panel/config/configService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_operaciones_log' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashboardreal-jsx:refrescar',
      kind: 'action',
      module: 'panel',
      label: 'refrescar',
      displayLabel: 'Refrescar',
      description: 'Actualiza refrescar aplicando las validaciones del servicio.',
      signature: 'refrescar()',
      source: 'src/pages/Panel/dash/DashboardReal.jsx',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-dash-dashboardreal-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Dashboard Real',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/dash/DashboardReal.jsx'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchConsolidados',
      kind: 'action',
      module: 'panel',
      label: 'fetchConsolidados',
      displayLabel: 'Fetch Consolidados',
      description:
        'Consulta fetch consolidados sobre tms_consolidados, tms_consolidado_nvs y entrega el resultado a la interfaz.',
      signature: 'fetchConsolidados()',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_consolidados' },
        { kind: 'table', name: 'tms_consolidado_nvs' }
      ]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-dash-dashdata-js',
      kind: 'component',
      module: 'panel',
      label: 'Dash Data',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/dash/dashData.js'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:run',
      kind: 'action',
      module: 'panel',
      label: 'run',
      displayLabel: 'Run',
      description: 'Ejecuta run; participa en lectura sobre tms_consolidado_nvs.',
      signature: 'run()',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_consolidado_nvs' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchDashboards',
      kind: 'action',
      module: 'panel',
      label: 'fetchDashboards',
      displayLabel: 'Fetch Dashboards',
      description:
        'Consulta fetch dashboards sobre dashboard_layouts y entrega el resultado a la interfaz.',
      signature: 'fetchDashboards()',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'dashboard_layouts' }]
    },
    {
      status: 'activo',
      id: 'resource:table:dashboard-layouts',
      kind: 'table',
      module: 'panel',
      label: 'dashboard_layouts',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchTransportistas',
      kind: 'action',
      module: 'panel',
      label: 'fetchTransportistas',
      displayLabel: 'Fetch Transportistas',
      description:
        'Consulta fetch transportistas sobre transportistas y entrega el resultado a la interfaz.',
      signature: 'fetchTransportistas(incluirInactivos = false)',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'transportistas' }]
    },
    {
      status: 'activo',
      id: 'resource:table:transportistas',
      kind: 'table',
      module: 'panel',
      label: 'transportistas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchVendedores',
      kind: 'action',
      module: 'panel',
      label: 'fetchVendedores',
      displayLabel: 'Fetch Vendedores',
      description:
        'Consulta fetch vendedores sobre vendedores y entrega el resultado a la interfaz.',
      signature: 'fetchVendedores(incluirInactivos = false)',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'vendedores' }]
    },
    {
      status: 'activo',
      id: 'resource:table:vendedores',
      kind: 'table',
      module: 'panel',
      label: 'vendedores',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchCalculatedFields',
      kind: 'action',
      module: 'panel',
      label: 'fetchCalculatedFields',
      displayLabel: 'Fetch Calculated Fields',
      description:
        'Consulta fetch calculated fields sobre builder_calculated_fields y entrega el resultado a la interfaz.',
      signature: 'fetchCalculatedFields(incluirInactivos = false)',
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'builder_calculated_fields' }]
    },
    {
      status: 'activo',
      id: 'resource:table:builder-calculated-fields',
      kind: 'table',
      module: 'panel',
      label: 'builder_calculated_fields',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-dash-dashdata-js:fetchAuditByNv',
      kind: 'action',
      module: 'panel',
      label: 'fetchAuditByNv',
      displayLabel: 'Fetch Audit By Nv',
      description:
        'Consulta fetch audit by nv sobre nv_bitacora y entrega el resultado a la interfaz.',
      signature: "fetchAuditByNv(nv, canal = 'ptm', limit = 60)",
      source: 'src/pages/Panel/dash/dashData.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'nv_bitacora' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:nv-bitacora',
      kind: 'rpc',
      module: 'panel',
      label: 'nv_bitacora',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-info-certificadossalida-jsx:CertificadosSalida',
      kind: 'action',
      module: 'panel',
      label: 'CertificadosSalida',
      displayLabel: 'Certificados Salida',
      description: 'Se consulta al expandir una N.V.; no añade tráfico a las búsquedas del Panel.',
      signature: 'CertificadosSalida({ operacionId })',
      source: 'src/pages/Panel/info/CertificadosSalida.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'nv_certificados_salida' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-info-certificadossalida-jsx',
      kind: 'component',
      module: 'panel',
      label: 'Certificados Salida',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/info/CertificadosSalida.jsx'
    },
    {
      status: 'activo',
      id: 'resource:rpc:nv-certificados-salida',
      kind: 'rpc',
      module: 'panel',
      label: 'nv_certificados_salida',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:run',
      kind: 'action',
      module: 'panel',
      label: 'run',
      displayLabel: 'Run',
      description: 'Ejecuta run; participa en lectura sobre tms_panel_transportistas.',
      signature: 'run()',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_panel_transportistas' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-ingresar-ingresarservice-js',
      kind: 'component',
      module: 'panel',
      label: 'Ingresar Service',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/ingresar/ingresarService.js'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:guardar',
      kind: 'action',
      module: 'panel',
      label: 'guardar',
      displayLabel: 'Guardar',
      description: 'Registra guardar sobre guardar_nv y devuelve el resultado de la operación.',
      signature: 'guardar(payload)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      kind: 'action',
      module: 'panel',
      label: 'puedeEditarOperacion',
      displayLabel: 'Puede Editar Operacion',
      description: 'Ejecuta puede editar operacion; participa en RPC sobre iam_puede_editar_nv.',
      signature: 'puedeEditarOperacion(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_puede_editar_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      kind: 'action',
      module: 'panel',
      label: 'puedeCambiarEstadoOperacion',
      displayLabel: 'Puede Cambiar Estado Operacion',
      description:
        'Ejecuta puede cambiar estado operacion; participa en RPC sobre iam_puede_cambiar_estado_nv.',
      signature: 'puedeCambiarEstadoOperacion(id, estado = null)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_puede_cambiar_estado_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      kind: 'action',
      module: 'panel',
      label: 'cambiarEstado',
      displayLabel: 'Cambiar Estado',
      description:
        'Actualiza cambiar estado sobre cambiar_estado_nv aplicando las validaciones del servicio.',
      signature: 'cambiarEstado(id, estado, urgente = null)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'cambiar_estado_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      kind: 'action',
      module: 'panel',
      label: 'corregirEstadoAShipping',
      displayLabel: 'Corregir Estado AShipping',
      description:
        'Ejecuta corregir estado ashipping; participa en RPC sobre corregir_estado_nv_a_shipping.',
      signature: 'corregirEstadoAShipping(id, motivo)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'corregir_estado_nv_a_shipping' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      kind: 'action',
      module: 'panel',
      label: 'gestionarPausaShipping',
      displayLabel: 'Gestionar Pausa Shipping',
      description:
        'Ejecuta gestionar pausa shipping; participa en RPC sobre gestionar_pausa_shipping_nv.',
      signature: "gestionarPausaShipping(id, subestado = null, motivo = '')",
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'gestionar_pausa_shipping_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      kind: 'action',
      module: 'panel',
      label: 'reportarIncidenciaArmado',
      displayLabel: 'Reportar Incidencia Armado',
      description:
        'Ejecuta reportar incidencia armado; participa en RPC sobre reportar_incidencia_armado_nv.',
      signature: 'reportarIncidenciaArmado(id, observacion)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'reportar_incidencia_armado_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      kind: 'action',
      module: 'panel',
      label: 'actualizarCampos',
      displayLabel: 'Actualizar Campos',
      description:
        'Actualiza actualizar campos sobre guardar_nv aplicando las validaciones del servicio.',
      signature: 'actualizarCampos(id, dirty)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      kind: 'action',
      module: 'panel',
      label: 'listarSolicitudesReapertura',
      displayLabel: 'Listar Solicitudes Reapertura',
      description:
        'Consulta listar solicitudes reapertura sobre tms_nv_reaperturas y entrega el resultado a la interfaz.',
      signature: 'listarSolicitudesReapertura(operacionId)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_nv_reaperturas' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      kind: 'action',
      module: 'panel',
      label: 'solicitarReapertura',
      displayLabel: 'Solicitar Reapertura',
      description: 'Ejecuta solicitar reapertura; participa en RPC sobre solicitar_reapertura_nv.',
      signature: 'solicitarReapertura(id, motivo)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'solicitar_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      kind: 'action',
      module: 'panel',
      label: 'resolverReapertura',
      displayLabel: 'Resolver Reapertura',
      description:
        'Actualiza resolver reapertura sobre resolver_reapertura_nv aplicando las validaciones del servicio.',
      signature: "resolverReapertura(requestId, aprobar, observacion = '')",
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      kind: 'action',
      module: 'panel',
      label: 'eliminar',
      displayLabel: 'Eliminar',
      description: 'Elimina o revoca eliminar sobre eliminar_nv según las reglas de acceso.',
      signature: 'eliminar(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      kind: 'action',
      module: 'panel',
      label: 'listarConsolidados',
      displayLabel: 'Listar Consolidados',
      description:
        'Consulta listar consolidados sobre tms_consolidados, tms_consolidado_nvs y entrega el resultado a la interfaz.',
      signature: 'listarConsolidados()',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_consolidados' },
        { kind: 'table', name: 'tms_consolidado_nvs' }
      ]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      kind: 'action',
      module: 'panel',
      label: 'guardarConsolidado',
      displayLabel: 'Guardar Consolidado',
      description:
        'Registra guardar consolidado sobre guardar_consolidado y devuelve el resultado de la operación.',
      signature: 'guardarConsolidado(p)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'guardar_consolidado' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      kind: 'action',
      module: 'panel',
      label: 'eliminarConsolidado',
      displayLabel: 'Eliminar Consolidado',
      description:
        'Elimina o revoca eliminar consolidado sobre eliminar_consolidado según las reglas de acceso.',
      signature: 'eliminarConsolidado(id)',
      source: 'src/pages/Panel/ingresar/ingresarService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'eliminar_consolidado' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-panelqueries-js:centrosPermitidos',
      kind: 'action',
      module: 'panel',
      label: 'centrosPermitidos',
      displayLabel: 'Centros Permitidos',
      description: 'Ejecuta centros permitidos; participa en RPC sobre iam_mis_scopes.',
      signature: 'centrosPermitidos()',
      source: 'src/pages/Panel/panelQueries.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'iam_mis_scopes' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-panelqueries-js',
      kind: 'component',
      module: 'panel',
      label: 'Panel Queries',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/panelQueries.js'
    },
    {
      status: 'activo',
      id: 'resource:rpc:iam-mis-scopes',
      kind: 'rpc',
      module: 'panel',
      label: 'iam_mis_scopes',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      kind: 'action',
      module: 'panel',
      label: 'fetchReopenInbox',
      displayLabel: 'Fetch Reopen Inbox',
      description:
        'Consulta fetch reopen inbox sobre listar_bandeja_reaperturas_nv y entrega el resultado a la interfaz.',
      signature: "fetchReopenInbox({ status = '', search = '', limit = 200 } = {})",
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'listar_bandeja_reaperturas_nv' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-reaperturas-reopenrequestsservice-js',
      kind: 'component',
      module: 'panel',
      label: 'Reopen Requests Service',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      kind: 'action',
      module: 'panel',
      label: 'resolveReopenRequest',
      displayLabel: 'Resolve Reopen Request',
      description:
        'Actualiza resolve reopen request sobre resolver_reapertura_nv aplicando las validaciones del servicio.',
      signature: "resolveReopenRequest(requestId, approve, observation = '')",
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'resolver_reapertura_nv' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:subscribeToReopenRequests',
      kind: 'action',
      module: 'panel',
      label: 'subscribeToReopenRequests',
      displayLabel: 'Subscribe To Reopen Requests',
      description: 'Ejecuta subscribe to reopen requests; participa en Realtime.',
      signature: 'subscribeToReopenRequests(onChange)',
      source: 'src/pages/Panel/reaperturas/reopenRequestsService.js',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-rutas-routecoordinationservice-js:rpc',
      kind: 'action',
      module: 'panel',
      label: 'rpc',
      displayLabel: 'Rpc',
      description:
        'Ejecuta rpc; participa en RPC, Edge Function, Realtime sobre coord-route-distance.',
      signature: 'rpc(name, params = {})',
      source: 'src/pages/Panel/rutas/routeCoordinationService.js',
      operations: ['RPC', 'Edge Function', 'Realtime'],
      resources: [{ kind: 'edge-function', name: 'coord-route-distance' }]
    },
    {
      status: 'activo',
      id: 'component:src-pages-panel-rutas-routecoordinationservice-js',
      kind: 'component',
      module: 'panel',
      label: 'Route Coordination Service',
      description: 'Componente interno que participa en Panel PTM.',
      source: 'src/pages/Panel/rutas/routeCoordinationService.js'
    },
    {
      status: 'activo',
      id: 'edge:coord-route-distance',
      kind: 'edge-function',
      module: 'admin',
      label: 'coord-route-distance',
      description: 'Función Edge coord-route-distance.',
      source: 'supabase/functions/coord-route-distance/index.ts'
    },
    {
      status: 'activo',
      id: 'action:src-pages-panel-tv-paneltvreal-jsx:TVDashboard',
      kind: 'action',
      module: 'panel',
      label: 'TVDashboard',
      displayLabel: 'TVDashboard',
      description: 'Ejecuta tvdashboard; participa en Realtime.',
      signature: 'TVDashboard()',
      source: 'src/pages/Panel/tv/PanelTVReal.jsx',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'action:src-pages-postventa-solicitudpublica-jsx:enviar',
      kind: 'action',
      module: 'postventa',
      label: 'enviar',
      displayLabel: 'Enviar',
      description:
        'Registra enviar sobre postventa-publico y devuelve el resultado de la operación.',
      signature: 'enviar(e)',
      source: 'src/pages/Postventa/SolicitudPublica.jsx',
      operations: ['Edge Function'],
      resources: [{ kind: 'edge-function', name: 'postventa-publico' }]
    },
    {
      status: 'activo',
      id: 'edge:postventa-publico',
      kind: 'edge-function',
      module: 'admin',
      label: 'postventa-publico',
      description: 'Recibe solicitudes públicas de servicio técnico.',
      source: 'supabase/functions/postventa-publico/index.ts'
    },
    {
      status: 'activo',
      id: 'action:src-pages-public-consultanv-jsx:ConsultaNV',
      kind: 'action',
      module: 'public',
      label: 'ConsultaNV',
      displayLabel: 'Consulta NV',
      description: 'Ejecuta consulta nv; participa en RPC sobre buscar_nv_publico.',
      signature: 'ConsultaNV()',
      source: 'src/pages/Public/ConsultaNV.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'buscar_nv_publico' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:buscar-nv-publico',
      kind: 'rpc',
      module: 'public',
      label: 'buscar_nv_publico',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-quality-clasificacionproductos-jsx:ClasificacionProductos',
      kind: 'action',
      module: 'quality',
      label: 'ClasificacionProductos',
      displayLabel: 'Clasificacion Productos',
      description:
        'Clasificación de productos por GRUPO comercial (ERP) para el checklist de Calidad. Carga el mapeo producto→grupo (archivo público generado desde el Excel del ERP) vía RPC gateada, y reclasifica las recepciones existentes.',
      signature: 'ClasificacionProductos()',
      source: 'src/pages/Quality/ClasificacionProductos.jsx',
      operations: ['lectura'],
      resources: [
        { kind: 'table', name: 'tms_producto_categoria' },
        { kind: 'table', name: 'tms_categorias_calidad' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-producto-categoria',
      kind: 'table',
      module: 'quality',
      label: 'tms_producto_categoria',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-categorias-calidad',
      kind: 'table',
      module: 'quality',
      label: 'tms_categorias_calidad',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-addresses-jsx:descargarMatriz',
      kind: 'action',
      module: 'queries',
      label: 'descargarMatriz',
      displayLabel: 'Descargar Matriz',
      description:
        'Descarga TODA la tabla tms_direcciones a Excel, paginando de a 1000 (Supabase corta a ~1000 filas por request).',
      signature: 'descargarMatriz()',
      source: 'src/pages/Queries/Addresses.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_direcciones' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-direcciones',
      kind: 'table',
      module: 'queries',
      label: 'tms_direcciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-addresses-jsx:handleSearch',
      kind: 'action',
      module: 'queries',
      label: 'handleSearch',
      displayLabel: 'Handle Search',
      description: 'Ejecuta handle search; participa en RPC sobre buscar_direcciones.',
      signature: 'handleSearch()',
      source: 'src/pages/Queries/Addresses.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'buscar_direcciones' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:buscar-direcciones',
      kind: 'rpc',
      module: 'queries',
      label: 'buscar_direcciones',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-addresses-jsx:deleteRow',
      kind: 'action',
      module: 'queries',
      label: 'deleteRow',
      displayLabel: 'Delete Row',
      description: 'Elimina un registro por id (lo usa tanto la fila como el modal).',
      signature: 'deleteRow(id)',
      source: 'src/pages/Queries/Addresses.jsx',
      operations: ['eliminación'],
      resources: [{ kind: 'table', name: 'tms_direcciones' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-addresses-jsx:saveEdit',
      kind: 'action',
      module: 'queries',
      label: 'saveEdit',
      displayLabel: 'Save Edit',
      description: 'Ejecuta save edit; participa en actualización sobre tms_direcciones.',
      signature: 'saveEdit()',
      source: 'src/pages/Queries/Addresses.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_direcciones' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-batches-jsx:Batches',
      kind: 'action',
      module: 'queries',
      label: 'Batches',
      displayLabel: 'Batches',
      description:
        'Ejecuta batches; participa en RPC sobre search_batches, .animate-header, .animate-search, .animate-decor.',
      signature: 'Batches()',
      source: 'src/pages/Queries/Batches.jsx',
      operations: ['RPC'],
      resources: [
        { kind: 'rpc', name: 'search_batches' },
        { kind: 'table', name: '.animate-header' },
        { kind: 'table', name: '.animate-search' },
        { kind: 'table', name: '.animate-decor' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:search-batches',
      kind: 'rpc',
      module: 'queries',
      label: 'search_batches',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:animate-header',
      kind: 'table',
      module: 'queries',
      label: '.animate-header',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:animate-search',
      kind: 'table',
      module: 'queries',
      label: '.animate-search',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:animate-decor',
      kind: 'table',
      module: 'queries',
      label: '.animate-decor',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-consultagrupo-jsx:ConsultaGrupo',
      kind: 'action',
      module: 'queries',
      label: 'ConsultaGrupo',
      displayLabel: 'Consulta Grupo',
      description:
        'Consulta de GRUPO comercial por SKU (o nombre). Lee tms_producto_grupo, que se alimenta desde Carga Masiva → Grupos de SKU (Excel del ERP).',
      signature: 'ConsultaGrupo()',
      source: 'src/pages/Queries/ConsultaGrupo.jsx',
      operations: ['RPC'],
      resources: [{ kind: 'rpc', name: 'consultar_grupo' }]
    },
    {
      status: 'activo',
      id: 'resource:rpc:consultar-grupo',
      kind: 'rpc',
      module: 'queries',
      label: 'consultar_grupo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-dispatchcontrol-jsx:DispatchControl',
      kind: 'action',
      module: 'queries',
      label: 'DispatchControl',
      displayLabel: 'Dispatch Control',
      description: 'Ejecuta dispatch control; participa en lectura sobre tms_control_despacho.',
      signature: 'DispatchControl()',
      source: 'src/pages/Queries/DispatchControl.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_control_despacho' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-heatmap-jsx:Heatmap',
      kind: 'action',
      module: 'queries',
      label: 'Heatmap',
      displayLabel: 'Heatmap',
      description:
        'Ejecuta heatmap; participa en lógica de aplicación sobre .hm-fade, .rack-section.',
      signature: 'Heatmap()',
      source: 'src/pages/Queries/Heatmap.jsx',
      operations: [],
      resources: [
        { kind: 'table', name: '.hm-fade' },
        { kind: 'table', name: '.rack-section' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:table:hm-fade',
      kind: 'table',
      module: 'queries',
      label: '.hm-fade',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rack-section',
      kind: 'table',
      module: 'queries',
      label: '.rack-section',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-historialnv-jsx:HistorialNV',
      kind: 'action',
      module: 'queries',
      label: 'HistorialNV',
      displayLabel: 'Historial NV',
      description: 'Ejecuta historial nv; participa en lectura sobre tms_nv_diarias.',
      signature: 'HistorialNV()',
      source: 'src/pages/Queries/HistorialNV.jsx',
      operations: ['lectura'],
      resources: [{ kind: 'table', name: 'tms_nv_diarias' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-nv-diarias',
      kind: 'table',
      module: 'queries',
      label: 'tms_nv_diarias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-productdatasheet-jsx:ProductDatasheet',
      kind: 'action',
      module: 'queries',
      label: 'ProductDatasheet',
      displayLabel: 'Product Datasheet',
      description:
        'Ejecuta product datasheet; participa en RPC sobre search_productos, get_ficha_producto.',
      signature: 'ProductDatasheet()',
      source: 'src/pages/Queries/ProductDatasheet.jsx',
      operations: ['RPC'],
      resources: [
        { kind: 'rpc', name: 'search_productos' },
        { kind: 'rpc', name: 'get_ficha_producto' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:search-productos',
      kind: 'rpc',
      module: 'queries',
      label: 'search_productos',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:get-ficha-producto',
      kind: 'rpc',
      module: 'queries',
      label: 'get_ficha_producto',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-productdatasheet-jsx:handleFile',
      kind: 'action',
      module: 'queries',
      label: 'handleFile',
      displayLabel: 'Handle File',
      description: '── Subir foto (cámara o galería) ──',
      signature: 'handleFile(e)',
      source: 'src/pages/Queries/ProductDatasheet.jsx',
      operations: ['creación', 'archivo'],
      resources: [{ kind: 'table', name: 'tms_fichas_imagenes' }]
    },
    {
      status: 'activo',
      id: 'resource:table:tms-fichas-imagenes',
      kind: 'table',
      module: 'queries',
      label: 'tms_fichas_imagenes',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-productdatasheet-jsx:deleteFoto',
      kind: 'action',
      module: 'queries',
      label: 'deleteFoto',
      displayLabel: 'Delete Foto',
      description:
        'Ejecuta delete foto; participa en eliminación, archivo sobre tms_fichas_imagenes.',
      signature: 'deleteFoto(img)',
      source: 'src/pages/Queries/ProductDatasheet.jsx',
      operations: ['eliminación', 'archivo'],
      resources: [{ kind: 'table', name: 'tms_fichas_imagenes' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-productdatasheet-jsx:setPrincipal',
      kind: 'action',
      module: 'queries',
      label: 'setPrincipal',
      displayLabel: 'Set Principal',
      description: 'Ejecuta set principal; participa en actualización sobre tms_fichas_imagenes.',
      signature: 'setPrincipal(img)',
      source: 'src/pages/Queries/ProductDatasheet.jsx',
      operations: ['actualización'],
      resources: [{ kind: 'table', name: 'tms_fichas_imagenes' }]
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-salesstatus-jsx:SalesStatus',
      kind: 'action',
      module: 'queries',
      label: 'SalesStatus',
      displayLabel: 'Sales Status',
      description:
        'Ejecuta sales status; participa en lectura, RPC sobre fuzzy_search, tms_nv_diarias, tms_entregas.',
      signature: 'SalesStatus()',
      source: 'src/pages/Queries/SalesStatus.jsx',
      operations: ['lectura', 'RPC'],
      resources: [
        { kind: 'rpc', name: 'fuzzy_search' },
        { kind: 'table', name: 'tms_nv_diarias' },
        { kind: 'table', name: 'tms_entregas' }
      ]
    },
    {
      status: 'activo',
      id: 'resource:rpc:fuzzy-search',
      kind: 'rpc',
      module: 'queries',
      label: 'fuzzy_search',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-entregas',
      kind: 'table',
      module: 'queries',
      label: 'tms_entregas',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'action:src-pages-queries-salesstatus-jsx:debouncedInvalidateSearch',
      kind: 'action',
      module: 'queries',
      label: 'debouncedInvalidateSearch',
      displayLabel: 'Debounced Invalidate Search',
      description: 'Ejecuta debounced invalidate search; participa en Realtime.',
      signature: 'debouncedInvalidateSearch()',
      source: 'src/pages/Queries/SalesStatus.jsx',
      operations: ['Realtime'],
      resources: []
    },
    {
      status: 'activo',
      id: 'edge:api-v1',
      kind: 'edge-function',
      module: 'admin',
      label: 'api-v1',
      description: 'Expone la API operacional autenticada por claves y scopes.',
      source: 'supabase/functions/api-v1/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:api-validar',
      kind: 'rpc',
      module: 'admin',
      label: '_api_validar',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-api-log',
      kind: 'table',
      module: 'admin',
      label: 'tms_api_log',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-operaciones',
      kind: 'table',
      module: 'admin',
      label: 'tms_operaciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:capgo-deploy',
      kind: 'edge-function',
      module: 'admin',
      label: 'capgo-deploy',
      description: 'Orquesta despliegues OTA de la aplicación móvil.',
      source: 'supabase/functions/capgo-deploy/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:puede-desplegar-ota',
      kind: 'rpc',
      module: 'admin',
      label: 'puede_desplegar_ota',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:rpc:registrar-despliegue-ota',
      kind: 'rpc',
      module: 'admin',
      label: 'registrar_despliegue_ota',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:coord-rutas-distancias-cache',
      kind: 'table',
      module: 'admin',
      label: 'coord_rutas_distancias_cache',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:notify-ticket',
      kind: 'edge-function',
      module: 'admin',
      label: 'notify-ticket',
      description: 'Notifica la creación de tickets de servicio técnico.',
      source: 'supabase/functions/notify-ticket/index.ts'
    },
    {
      status: 'activo',
      id: 'edge:notify-ticket-update',
      kind: 'edge-function',
      module: 'admin',
      label: 'notify-ticket-update',
      description: 'Notifica cambios relevantes de tickets existentes.',
      source: 'supabase/functions/notify-ticket-update/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:table:mobile-ota-bundles',
      kind: 'table',
      module: 'admin',
      label: 'mobile_ota_bundles',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:mobile-ota-channels',
      kind: 'table',
      module: 'admin',
      label: 'mobile_ota_channels',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:mobile-ota-devices',
      kind: 'table',
      module: 'admin',
      label: 'mobile_ota_devices',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:ota-publish',
      kind: 'edge-function',
      module: 'admin',
      label: 'ota-publish',
      description: 'Función Edge ota-publish.',
      source: 'supabase/functions/ota-publish/index.ts'
    },
    {
      status: 'activo',
      id: 'edge:ota-updates',
      kind: 'edge-function',
      module: 'admin',
      label: 'ota-updates',
      description: 'Función Edge ota-updates.',
      source: 'supabase/functions/ota-updates/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:table:mobile-ota-events',
      kind: 'table',
      module: 'admin',
      label: 'mobile_ota_events',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:postventa-extractor',
      kind: 'edge-function',
      module: 'admin',
      label: 'postventa-extractor',
      description: 'Extrae y normaliza solicitudes de postventa recibidas.',
      source: 'supabase/functions/postventa-extractor/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:ingesta-pv-correo',
      kind: 'rpc',
      module: 'admin',
      label: 'ingesta_pv_correo',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:tms-postventa-correos',
      kind: 'table',
      module: 'admin',
      label: 'tms_postventa_correos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:postventa-inbox',
      kind: 'edge-function',
      module: 'admin',
      label: 'postventa-inbox',
      description: 'Sincroniza la bandeja de entrada de Post-Venta.',
      source: 'supabase/functions/postventa-inbox/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-pv-ticket-publico',
      kind: 'rpc',
      module: 'admin',
      label: 'crear_pv_ticket_publico',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:rendiciones-publicas',
      kind: 'edge-function',
      module: 'admin',
      label: 'rendiciones-publicas',
      description: 'Función Edge rendiciones-publicas.',
      source: 'supabase/functions/rendiciones-publicas/index.ts'
    },
    {
      status: 'activo',
      id: 'resource:rpc:crear-rendicion-publica',
      kind: 'rpc',
      module: 'admin',
      label: 'crear_rendicion_publica',
      description: 'RPC utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:storage:rendicion-evidencias',
      kind: 'storage',
      module: 'admin',
      label: 'rendicion-evidencias',
      description: 'Storage utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-public-links',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_public_links',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendiciones',
      kind: 'table',
      module: 'admin',
      label: 'rendiciones',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-fotos',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_fotos',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-public-log',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_public_log',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-centros-costo',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_centros_costo',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-colaboradores',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_colaboradores',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-categorias',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_categorias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-subcategorias',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_subcategorias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-categoria-subcategoria',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_categoria_subcategoria',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-items',
      kind: 'table',
      module: 'admin',
      label: 'rendicion_items',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'resource:table:rendicion-evidencias',
      kind: 'table',
      module: 'admin',
      label: 'rendicion-evidencias',
      description: 'Tabla utilizada por la aplicación.',
      source: null
    },
    {
      status: 'activo',
      id: 'edge:send-push',
      kind: 'edge-function',
      module: 'admin',
      label: 'send-push',
      description: 'Despacha notificaciones push a dispositivos registrados.',
      source: 'supabase/functions/send-push/index.ts'
    }
  ],
  is = [
    {
      id: 'connection:1',
      from: 'module:public',
      to: 'screen:login',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:2',
      from: 'module:public',
      to: 'screen:consulta',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:3',
      from: 'module:public',
      to: 'screen:verificar',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:4',
      from: 'module:public',
      to: 'screen:soporte',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:5',
      from: 'module:admin',
      to: 'screen:seguridad',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:6',
      from: 'module:tms',
      to: 'screen:tms-control',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:7',
      from: 'module:tms',
      to: 'screen:tms-pda',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:8',
      from: 'module:inventario',
      to: 'screen:mobile-pda',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:9',
      from: 'module:inbound',
      to: 'screen:inbound-reception',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:10',
      from: 'module:inbound',
      to: 'screen:inbound-reception-nacional',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:11',
      from: 'module:inbound',
      to: 'screen:inbound-entry',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:12',
      from: 'module:inbound',
      to: 'screen:inbound-cubing',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:13',
      from: 'module:inbound',
      to: 'screen:inbound-data-import',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:14',
      from: 'module:queries',
      to: 'screen:queries-batches',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:15',
      from: 'module:queries',
      to: 'screen:queries-sales-status',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:16',
      from: 'module:queries',
      to: 'screen:queries-addresses',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:17',
      from: 'module:queries',
      to: 'screen:queries-locations',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:18',
      from: 'module:queries',
      to: 'screen:queries-historial-nv',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:19',
      from: 'module:queries',
      to: 'screen:queries-dispatch-control',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:20',
      from: 'module:queries',
      to: 'screen:queries-datasheet',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:21',
      from: 'module:queries',
      to: 'screen:queries-grupo',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:22',
      from: 'module:panel',
      to: 'screen:panel',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:23',
      from: 'module:panel',
      to: 'screen:panel-ingresar',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:24',
      from: 'module:panel',
      to: 'screen:panel-reaperturas',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:25',
      from: 'module:panel',
      to: 'screen:panel-info',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:26',
      from: 'module:panel',
      to: 'screen:panel-tv',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:27',
      from: 'module:panel',
      to: 'screen:panel-builder',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:28',
      from: 'module:panel',
      to: 'screen:panel-configuracion',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:29',
      from: 'module:inventario',
      to: 'screen:inventory-traspasos',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:30',
      from: 'module:inventario',
      to: 'screen:queries-heatmap',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:31',
      from: 'module:inventario',
      to: 'screen:admin-locations',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:32',
      from: 'module:inventario',
      to: 'screen:admin-location-requests',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:33',
      from: 'module:inventario',
      to: 'screen:inventory-conteo',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:34',
      from: 'module:inventario',
      to: 'screen:inventory-conteo-tab-sesiones',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:35',
      from: 'module:inventario',
      to: 'screen:inventory-conteo-tab-conciliacion',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:36',
      from: 'module:inventario',
      to: 'screen:inventory-conteo-tab-ajuste',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:37',
      from: 'module:inventario',
      to: 'screen:inventory-conteo-tab-bloques',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:38',
      from: 'module:inventario',
      to: 'screen:inventory-conteo-tab-proyeccion',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:39',
      from: 'module:inventario',
      to: 'screen:inventory-analisis',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:40',
      from: 'module:inventario',
      to: 'screen:inventory-analisis-tab-antiguos-disp',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:41',
      from: 'module:inventario',
      to: 'screen:inventory-analisis-tab-no-activos-stock',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:42',
      from: 'module:inventario',
      to: 'screen:inventory-analisis-tab-duplicados',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:43',
      from: 'module:inventario',
      to: 'screen:inventory-analisis-tab-anomalias',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:44',
      from: 'module:inventario',
      to: 'screen:inventory-analisis-tab-detalle',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:45',
      from: 'module:inventario',
      to: 'screen:inventory-carteles',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:46',
      from: 'module:inventario',
      to: 'screen:inventory-insumos',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:47',
      from: 'module:quality',
      to: 'screen:quality-monitoreo',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:48',
      from: 'module:quality',
      to: 'screen:quality-acciones',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:49',
      from: 'module:quality',
      to: 'screen:quality-bandeja',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:50',
      from: 'module:quality',
      to: 'screen:quality-clasificacion',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:51',
      from: 'module:postventa',
      to: 'screen:postventa-tickets',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:52',
      from: 'module:postventa',
      to: 'screen:postventa-tickets-tab-bandeja',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:53',
      from: 'module:postventa',
      to: 'screen:postventa-tickets-tab-calendario',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:54',
      from: 'module:postventa',
      to: 'screen:postventa-tickets-tab-nuevo',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:55',
      from: 'module:postventa',
      to: 'screen:postventa-tickets-tab-dashboard',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:56',
      from: 'module:postventa',
      to: 'screen:postventa-tickets-tab-tecnicos',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:57',
      from: 'module:admin',
      to: 'screen:admin-users',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:58',
      from: 'module:admin',
      to: 'screen:admin-roles',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:59',
      from: 'module:admin',
      to: 'screen:admin-views',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:60',
      from: 'module:admin',
      to: 'screen:admin-cleanup',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:61',
      from: 'module:admin',
      to: 'screen:admin-tickets',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:62',
      from: 'module:admin',
      to: 'screen:admin-upload-history',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:63',
      from: 'module:admin',
      to: 'screen:admin-bodegas-softland',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:64',
      from: 'module:admin',
      to: 'screen:admin-monitor',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:65',
      from: 'module:admin',
      to: 'screen:admin-observability',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:66',
      from: 'module:admin',
      to: 'screen:admin-workflows',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:67',
      from: 'module:admin',
      to: 'screen:admin-flujo-maestro',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:68',
      from: 'module:admin',
      to: 'screen:admin-eventos',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:69',
      from: 'module:admin',
      to: 'screen:admin-api',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:70',
      from: 'module:admin',
      to: 'screen:admin-rendiciones',
      relation: 'contiene',
      label: 'incluye pantalla'
    },
    {
      id: 'connection:71',
      from: 'module:panel',
      to: 'service:src-pages-panel-builder-builderservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:72',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchDashboards',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:73',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:saveDashboard',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:74',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:deleteDashboard',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:75',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:76',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:77',
      from: 'service:src-pages-panel-builder-builderservice-js',
      to: 'function:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:78',
      from: 'module:panel',
      to: 'service:src-pages-panel-config-configservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:79',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:fetchTransportistas',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:80',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:saveTransportista',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:81',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:toggleTransportista',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:82',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:deleteTransportista',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:83',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:fetchVendedores',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:84',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:saveVendedor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:85',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:toggleVendedor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:86',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:deleteVendedor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:87',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:fetchAuditoria',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:88',
      from: 'service:src-pages-panel-config-configservice-js',
      to: 'function:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:89',
      from: 'module:panel',
      to: 'service:src-pages-panel-ingresar-ingresarservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:90',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:colorFor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:91',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:esClienteOrange',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:92',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listaActivas',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:93',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperaciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:94',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperacionesUltraLocal',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:95',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:fusionarResultadosBusqueda',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:96',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:opciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:97',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:98',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:costoDeVendedor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:99',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:100',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:101',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupOrangeAssociation',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:102',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:exportarOperaciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:103',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:guardar',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:104',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:105',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:106',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:107',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:108',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:109',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:110',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:111',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:112',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:113',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:114',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:115',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:116',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:117',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:118',
      from: 'service:src-pages-panel-ingresar-ingresarservice-js',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvBasico',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:119',
      from: 'module:panel',
      to: 'service:src-pages-panel-reaperturas-reopenrequestsservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:120',
      from: 'service:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:121',
      from: 'service:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:122',
      from: 'service:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:subscribeToReopenRequests',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:123',
      from: 'module:panel',
      to: 'service:src-pages-panel-rutas-routecoordinationservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:124',
      from: 'module:inventario',
      to: 'service:src-services-analisisservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:125',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:126',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:127',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:enviarAEmil',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:128',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:129',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:130',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:131',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:132',
      from: 'service:src-services-analisisservice-js',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:133',
      from: 'module:admin',
      to: 'service:src-services-apiservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:134',
      from: 'service:src-services-apiservice-js',
      to: 'function:src-services-apiservice-js:listarApiKeys',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:135',
      from: 'service:src-services-apiservice-js',
      to: 'function:src-services-apiservice-js:crearApiKey',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:136',
      from: 'service:src-services-apiservice-js',
      to: 'function:src-services-apiservice-js:revocarApiKey',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:137',
      from: 'service:src-services-apiservice-js',
      to: 'function:src-services-apiservice-js:listarApiLog',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:138',
      from: 'module:asistente',
      to: 'service:src-services-asistenteservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:139',
      from: 'service:src-services-asistenteservice-js',
      to: 'function:src-services-asistenteservice-js:preguntarAsistente',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:140',
      from: 'module:quality',
      to: 'service:src-services-calidadservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:141',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useInformes',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:142',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useInformeItems',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:143',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:fetchCandidatos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:144',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:fetchCandidatosSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:145',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:fetchLotesSeries',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:146',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:pushAdminInventario',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:147',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:notificarInventarioPush',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:148',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:notificarDictamenPush',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:149',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:marcarPreliminarCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:150',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCrearInforme',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:151',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useActualizarEstadoInforme',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:152',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useActualizarInforme',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:153',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useEliminarInforme',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:154',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:155',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useInformeEvidencias',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:156',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:uploadEvidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:157',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:deleteEvidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:158',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:updateEvidenciaDescripcion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:159',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useDictaminar',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:160',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCategoriasTarea',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:161',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:cargarClasificacionGrupos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:162',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:reclasificarRecepciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:163',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useTareasChecklist',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:164',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useTareasPendientesCount',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:165',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useFirmarCertificado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:166',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:verificarCertificado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:167',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAsignacionesCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:168',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAsignacionesPendientesCount',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:169',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCrearAsignacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:170',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:tomarAsignacionCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:171',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:guardarProgresoAsignacionCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:172',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:liberarAsignacionCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:173',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useResolverAsignacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:174',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAnularAsignacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:175',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:riesgoIngreso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:176',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:indicadoresIso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:177',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:resultadoPeso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:178',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:semaforoSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:179',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:uploadEvidenciaSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:180',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:deleteEvidenciaSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:181',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:uploadEvidenciaIngreso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:182',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useTareasSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:183',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useSalidaPendientesCount',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:184',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:buscarDespachos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:185',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCrearTareaSalida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:186',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCrearTareaSalidaManual',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:187',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useEliminarTareaCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:188',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useEliminarAsignacionCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:189',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useBodegasSoftland',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:190',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useBodegasDestino',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:191',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useGuardarBodegaSoftland',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:192',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useEliminarBodegaSoftland',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:193',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useTrazabilidadProducto',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:194',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAreasCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:195',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAccionesCalidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:196',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAccionesPendientesCount',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:197',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useCrearAccion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:198',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useResolverAccion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:199',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAnularAccion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:200',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAccionATicketPv',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:201',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAccionCorreoEnviado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:202',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useAccionReferencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:203',
      from: 'service:src-services-calidadservice-js',
      to: 'function:src-services-calidadservice-js:useGuardarChecklist',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:204',
      from: 'module:inventario',
      to: 'service:src-services-conteoservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:205',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:206',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:207',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:208',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:209',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:210',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:211',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:212',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useEditarConteo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:213',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:214',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:215',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:216',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:217',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:218',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:219',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:220',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:221',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:222',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:223',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:224',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:225',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:226',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:227',
      from: 'service:src-services-conteoservice-js',
      to: 'function:src-services-conteoservice-js:useGuardarCosto',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:228',
      from: 'module:admin',
      to: 'service:src-services-downloadservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:229',
      from: 'service:src-services-downloadservice-js',
      to: 'function:src-services-downloadservice-js:saveReportBlob',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:230',
      from: 'service:src-services-downloadservice-js',
      to: 'function:src-services-downloadservice-js:downloadPdfDocument',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:231',
      from: 'module:admin',
      to: 'service:src-services-eventosservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:232',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:listarEventos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:233',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:listarReglas',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:234',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:guardarRegla',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:235',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:eliminarRegla',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:236',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:listarBandeja',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:237',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:metricasProceso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:238',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:misNotificaciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:239',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:marcarLeida',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:240',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:marcarTodasLeidas',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:241',
      from: 'service:src-services-eventosservice-js',
      to: 'function:src-services-eventosservice-js:despacharPush',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:242',
      from: 'module:admin',
      to: 'service:src-services-flujoservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:243',
      from: 'service:src-services-flujoservice-js',
      to: 'function:src-services-flujoservice-js:obtenerFlujo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:244',
      from: 'service:src-services-flujoservice-js',
      to: 'function:src-services-flujoservice-js:guardarFlujo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:245',
      from: 'module:admin',
      to: 'service:src-services-iamservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:246',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:catalogoScope',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:247',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:listarAsignaciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:248',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:asignarScope',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:249',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:revocarAsignacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:250',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:misScopes',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:251',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:sesiones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:252',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:forzarLogout',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:253',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:auditoria',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:254',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:auditoriaMeta',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:255',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:permisosStats',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:256',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:refrescarPermisos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:257',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:bulkUsuarios',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:258',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:listarPolicies',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:259',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:guardarPolicy',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:260',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:togglePolicy',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:261',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:probarEditarNV',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:262',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:delegaciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:263',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:delegar',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:264',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:revocarDelegacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:265',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:misCoberturas',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:266',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:usuariosLite',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:267',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:historialAcceso',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:268',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:historialAccesoResumen',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:269',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:catalogoOrg',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:270',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:listarTeams',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:271',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:guardarTeam',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:272',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:eliminarTeam',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:273',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:miembrosTeam',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:274',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:agregarMiembroTeam',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:275',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:quitarMiembroTeam',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:276',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:listarGroups',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:277',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:guardarGroup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:278',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:eliminarGroup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:279',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:miembrosGroup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:280',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:agregarMiembroGroup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:281',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:quitarMiembroGroup',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:282',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:asignacionesPrincipal',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:283',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:asignarRolPrincipal',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:284',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:revocarAsignacionPrincipal',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:285',
      from: 'service:src-services-iamservice-js',
      to: 'function:src-services-iamservice-js:refrescarGruposDinamicos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:286',
      from: 'module:inventario',
      to: 'service:src-services-insumosservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:287',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:semaforo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:288',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:listarInsumos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:289',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:setCantidad',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:290',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:guardarInsumo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:291',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:eliminarInsumo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:292',
      from: 'service:src-services-insumosservice-js',
      to: 'function:src-services-insumosservice-js:armarCorreoSolicitud',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:293',
      from: 'module:admin',
      to: 'service:src-services-mobileservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:294',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:onUpdateAvailable',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:295',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:getOTAChannel',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:296',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:setOTAChannel',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:297',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:initOTAUpdates',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:298',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:versionOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:299',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:buscarActualizacion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:300',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:applyPendingUpdate',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:301',
      from: 'service:src-services-mobileservice-js',
      to: 'function:src-services-mobileservice-js:initPushNotifications',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:302',
      from: 'module:admin',
      to: 'service:src-services-otadeployservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:303',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:listarDespliegueOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:304',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:promoverOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:305',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:eliminarBundleOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:306',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:obtenerGobernanzaOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:307',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:guardarGobernanzaOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:308',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:resumenDispositivosOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:309',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:historialOTA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:310',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:avisarNuevaVersionPush',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:311',
      from: 'service:src-services-otadeployservice-js',
      to: 'function:src-services-otadeployservice-js:limpiarBundlesViejos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:312',
      from: 'module:panel',
      to: 'service:src-services-panelptm-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:313',
      from: 'service:src-services-panelptm-js',
      to: 'function:src-services-panelptm-js:mapNvPanel',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:314',
      from: 'service:src-services-panelptm-js',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:315',
      from: 'module:postventa',
      to: 'service:src-services-postventaservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:316',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:317',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:318',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:319',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:320',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:321',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:322',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:323',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:324',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:325',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:326',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:327',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:328',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:329',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:330',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:331',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:332',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:333',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:334',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:335',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:336',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:337',
      from: 'service:src-services-postventaservice-js',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:338',
      from: 'module:admin',
      to: 'service:src-services-rendicionesservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:339',
      from: 'service:src-services-rendicionesservice-js',
      to: 'function:src-services-rendicionesservice-js:optimizePhoto',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:340',
      from: 'module:admin',
      to: 'service:src-services-securityservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:341',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:estadoMFA',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:342',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:enrolarTOTP',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:343',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:verificarTOTP',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:344',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:quitarFactor',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:345',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:nivelAAL',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:346',
      from: 'service:src-services-securityservice-js',
      to: 'function:src-services-securityservice-js:factoresVerificados',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:347',
      from: 'module:tms',
      to: 'service:src-services-tmsservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:348',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:listarOrdenes',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:349',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:listarVehiculos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:350',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:listarConductores',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:351',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:listarIncidencias',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:352',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:crearOrdenDesdeNV',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:353',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:asignarOrden',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:354',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:transicionOrden',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:355',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:registrarPOD',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:356',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:crearIncidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:357',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:resolverIncidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:358',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:subirEvidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:359',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:urlEvidencia',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:360',
      from: 'service:src-services-tmsservice-js',
      to: 'function:src-services-tmsservice-js:miConductorId',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:361',
      from: 'module:admin',
      to: 'service:src-services-workflowservice-js',
      relation: 'implementa',
      label: 'usa servicio'
    },
    {
      id: 'connection:362',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:listarDefiniciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:363',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:listarEstados',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:364',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:listarTransiciones',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:365',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:listarHistorial',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:366',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:listarPermisos',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:367',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:guardarDefinicion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:368',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:eliminarDefinicion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:369',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:guardarEstado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:370',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:eliminarEstado',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:371',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:guardarTransicion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:372',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:eliminarTransicion',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:373',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:transicionar',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:374',
      from: 'service:src-services-workflowservice-js',
      to: 'function:src-services-workflowservice-js:accionesDisponibles',
      relation: 'expone',
      label: 'expone función'
    },
    {
      id: 'connection:375',
      from: 'function:src-pages-panel-builder-builderservice-js:fetchDashboards',
      to: 'resource:table:tms-dashboard-layouts',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:376',
      from: 'function:src-pages-panel-builder-builderservice-js:saveDashboard',
      to: 'resource:rpc:guardar-dashboard',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:377',
      from: 'function:src-pages-panel-builder-builderservice-js:deleteDashboard',
      to: 'resource:rpc:eliminar-dashboard',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:378',
      from: 'function:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      to: 'resource:table:tms-builder-calculated-fields',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:379',
      from: 'function:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      to: 'resource:rpc:guardar-campo-calculado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:380',
      from: 'function:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      to: 'resource:rpc:eliminar-campo-calculado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:381',
      from: 'function:src-pages-panel-config-configservice-js:fetchAuditoria',
      to: 'resource:table:tms-operaciones-log',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:382',
      from: 'function:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      to: 'resource:table:tms-operaciones-log',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:383',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:opciones',
      to: 'resource:table:tms-panel-transportistas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:384',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      to: 'resource:table:tms-nv-catalogo',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:385',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      to: 'resource:table:tms-panel-vendedores',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:386',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:387',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:costoDeVendedor',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:388',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:389',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:costoDeVendedor',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:390',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:391',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupOrangeAssociation',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvCatalogo',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:392',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupOrangeAssociation',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:costoDeVendedor',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:393',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:guardar',
      to: 'resource:rpc:guardar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:394',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      to: 'resource:rpc:iam-puede-editar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:395',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      to: 'resource:rpc:iam-puede-cambiar-estado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:396',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      to: 'resource:rpc:cambiar-estado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:397',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      to: 'resource:rpc:corregir-estado-nv-a-shipping',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:398',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      to: 'resource:rpc:gestionar-pausa-shipping-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:399',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      to: 'resource:rpc:reportar-incidencia-armado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:400',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      to: 'resource:rpc:guardar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:401',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      to: 'resource:table:tms-nv-reaperturas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:402',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      to: 'resource:rpc:solicitar-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:403',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      to: 'resource:rpc:resolver-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:404',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      to: 'resource:rpc:eliminar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:405',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      to: 'resource:table:tms-consolidados',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:406',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      to: 'resource:table:tms-consolidado-nvs',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:407',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      to: 'resource:rpc:guardar-consolidado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:408',
      from: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      to: 'resource:rpc:eliminar-consolidado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:409',
      from: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      to: 'resource:rpc:listar-bandeja-reaperturas-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:410',
      from: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      to: 'resource:rpc:resolver-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:411',
      from: 'function:src-services-analisisservice-js:useAnalisisResumen',
      to: 'resource:rpc:analisis-codigos-resumen',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:412',
      from: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      to: 'resource:rpc:analisis-codigos',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:413',
      from: 'function:src-services-analisisservice-js:enviarAEmil',
      to: 'resource:table:tms-emil-sync',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:414',
      from: 'function:src-services-analisisservice-js:useCargarActivo',
      to: 'resource:rpc:bulk-upsert',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:415',
      from: 'function:src-services-analisisservice-js:useCargarStock',
      to: 'resource:rpc:bulk-upsert',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:416',
      from: 'function:src-services-analisisservice-js:useCargarStock',
      to: 'resource:table:tms-inventario-general',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:417',
      from: 'function:src-services-apiservice-js:listarApiKeys',
      to: 'resource:rpc:api-keys-listar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:418',
      from: 'function:src-services-apiservice-js:crearApiKey',
      to: 'resource:rpc:api-key-crear',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:419',
      from: 'function:src-services-apiservice-js:revocarApiKey',
      to: 'resource:rpc:api-key-revocar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:420',
      from: 'function:src-services-apiservice-js:listarApiLog',
      to: 'resource:rpc:api-log-listar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:421',
      from: 'function:src-services-calidadservice-js:useInformes',
      to: 'resource:table:tms-monitoreo-informes',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:422',
      from: 'function:src-services-calidadservice-js:useInformeItems',
      to: 'resource:table:tms-monitoreo-items',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:423',
      from: 'function:src-services-calidadservice-js:fetchCandidatos',
      to: 'resource:rpc:monitoreo-candidatos',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:424',
      from: 'function:src-services-calidadservice-js:fetchCandidatosSalida',
      to: 'resource:rpc:calidad-salida-candidatos',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:425',
      from: 'function:src-services-calidadservice-js:fetchLotesSeries',
      to: 'resource:rpc:calidad-lotes-series',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:426',
      from: 'function:src-services-calidadservice-js:pushAdminInventario',
      to: 'edge:notify-inventario',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:427',
      from: 'function:src-services-calidadservice-js:notificarInventarioPush',
      to: 'function:src-services-calidadservice-js:pushAdminInventario',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:428',
      from: 'function:src-services-calidadservice-js:notificarDictamenPush',
      to: 'function:src-services-calidadservice-js:pushAdminInventario',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:429',
      from: 'function:src-services-calidadservice-js:marcarPreliminarCalidad',
      to: 'resource:rpc:monitoreo-marcar-preliminar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:430',
      from: 'function:src-services-calidadservice-js:useActualizarEstadoInforme',
      to: 'resource:table:tms-monitoreo-informes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:431',
      from: 'function:src-services-calidadservice-js:useActualizarInforme',
      to: 'resource:rpc:actualizar-informe-monitoreo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:432',
      from: 'function:src-services-calidadservice-js:useEliminarInforme',
      to: 'resource:table:tms-monitoreo-informes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:433',
      from: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      to: 'resource:rpc:monitoreo-next-numero',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:434',
      from: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      to: 'resource:table:tms-monitoreo-informes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:435',
      from: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      to: 'resource:table:tms-monitoreo-items',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:436',
      from: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      to: 'resource:table:tms-monitoreo-evidencias',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:437',
      from: 'function:src-services-calidadservice-js:useInformeEvidencias',
      to: 'resource:table:tms-monitoreo-evidencias',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:438',
      from: 'function:src-services-calidadservice-js:uploadEvidencia',
      to: 'resource:table:tms-monitoreo-evidencias',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:439',
      from: 'function:src-services-calidadservice-js:deleteEvidencia',
      to: 'resource:table:tms-monitoreo-evidencias',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:440',
      from: 'function:src-services-calidadservice-js:updateEvidenciaDescripcion',
      to: 'resource:table:tms-monitoreo-evidencias',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:441',
      from: 'function:src-services-calidadservice-js:useDictaminar',
      to: 'resource:rpc:monitoreo-dictaminar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:442',
      from: 'function:src-services-calidadservice-js:useCategoriasTarea',
      to: 'resource:rpc:calidad-categorias-tarea',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:443',
      from: 'function:src-services-calidadservice-js:cargarClasificacionGrupos',
      to: 'resource:rpc:calidad-cargar-clasificacion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:444',
      from: 'function:src-services-calidadservice-js:reclasificarRecepciones',
      to: 'resource:rpc:calidad-reclasificar-recepciones',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:445',
      from: 'function:src-services-calidadservice-js:useTareasChecklist',
      to: 'resource:table:tms-calidad-tareas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:446',
      from: 'function:src-services-calidadservice-js:useTareasPendientesCount',
      to: 'function:src-services-calidadservice-js:useTareasChecklist',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:447',
      from: 'function:src-services-calidadservice-js:useFirmarCertificado',
      to: 'resource:rpc:firmar-certificado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:448',
      from: 'function:src-services-calidadservice-js:verificarCertificado',
      to: 'resource:rpc:verificar-certificado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:449',
      from: 'function:src-services-calidadservice-js:useAsignacionesCalidad',
      to: 'resource:table:tms-calidad-asignaciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:450',
      from: 'function:src-services-calidadservice-js:useAsignacionesPendientesCount',
      to: 'function:src-services-calidadservice-js:useAsignacionesCalidad',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:451',
      from: 'function:src-services-calidadservice-js:useCrearAsignacion',
      to: 'resource:rpc:crear-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:452',
      from: 'function:src-services-calidadservice-js:tomarAsignacionCalidad',
      to: 'resource:rpc:tomar-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:453',
      from: 'function:src-services-calidadservice-js:guardarProgresoAsignacionCalidad',
      to: 'resource:rpc:guardar-progreso-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:454',
      from: 'function:src-services-calidadservice-js:liberarAsignacionCalidad',
      to: 'resource:rpc:liberar-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:455',
      from: 'function:src-services-calidadservice-js:useResolverAsignacion',
      to: 'resource:rpc:resolver-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:456',
      from: 'function:src-services-calidadservice-js:useAnularAsignacion',
      to: 'resource:rpc:anular-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:457',
      from: 'function:src-services-calidadservice-js:useTareasSalida',
      to: 'resource:table:tms-calidad-tareas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:458',
      from: 'function:src-services-calidadservice-js:useSalidaPendientesCount',
      to: 'function:src-services-calidadservice-js:useTareasSalida',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:459',
      from: 'function:src-services-calidadservice-js:buscarDespachos',
      to: 'resource:table:tms-control-despacho',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:460',
      from: 'function:src-services-calidadservice-js:useCrearTareaSalida',
      to: 'resource:rpc:crear-tarea-salida',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:461',
      from: 'function:src-services-calidadservice-js:useCrearTareaSalidaManual',
      to: 'resource:rpc:crear-tarea-salida-manual',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:462',
      from: 'function:src-services-calidadservice-js:useEliminarTareaCalidad',
      to: 'resource:rpc:eliminar-tarea-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:463',
      from: 'function:src-services-calidadservice-js:useEliminarAsignacionCalidad',
      to: 'resource:rpc:eliminar-asignacion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:464',
      from: 'function:src-services-calidadservice-js:useBodegasSoftland',
      to: 'resource:table:tms-bodegas-softland',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:465',
      from: 'function:src-services-calidadservice-js:useBodegasDestino',
      to: 'function:src-services-calidadservice-js:useBodegasSoftland',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:466',
      from: 'function:src-services-calidadservice-js:useGuardarBodegaSoftland',
      to: 'resource:rpc:guardar-bodega-softland',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:467',
      from: 'function:src-services-calidadservice-js:useEliminarBodegaSoftland',
      to: 'resource:rpc:eliminar-bodega-softland',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:468',
      from: 'function:src-services-calidadservice-js:useTrazabilidadProducto',
      to: 'resource:rpc:trazabilidad-producto',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:469',
      from: 'function:src-services-calidadservice-js:useAreasCalidad',
      to: 'resource:table:tms-areas-calidad',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:470',
      from: 'function:src-services-calidadservice-js:useAccionesCalidad',
      to: 'resource:table:tms-calidad-acciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:471',
      from: 'function:src-services-calidadservice-js:useAccionesPendientesCount',
      to: 'function:src-services-calidadservice-js:useAccionesCalidad',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:472',
      from: 'function:src-services-calidadservice-js:useCrearAccion',
      to: 'resource:rpc:crear-accion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:473',
      from: 'function:src-services-calidadservice-js:useResolverAccion',
      to: 'resource:rpc:resolver-accion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:474',
      from: 'function:src-services-calidadservice-js:useAnularAccion',
      to: 'resource:rpc:anular-accion-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:475',
      from: 'function:src-services-calidadservice-js:useAccionATicketPv',
      to: 'resource:rpc:accion-a-ticket-pv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:476',
      from: 'function:src-services-calidadservice-js:useAccionCorreoEnviado',
      to: 'resource:rpc:accion-correo-enviado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:477',
      from: 'function:src-services-calidadservice-js:useAccionReferencia',
      to: 'resource:rpc:accion-registrar-referencia',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:478',
      from: 'function:src-services-calidadservice-js:useGuardarChecklist',
      to: 'resource:rpc:guardar-checklist-ingreso',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:479',
      from: 'function:src-services-conteoservice-js:conteoStockSistema',
      to: 'resource:rpc:conteo-stock-sistema',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:480',
      from: 'function:src-services-conteoservice-js:useSesionesConteo',
      to: 'resource:table:tms-conteo-sesiones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:481',
      from: 'function:src-services-conteoservice-js:useCrearSesion',
      to: 'resource:rpc:crear-conteo-sesion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:482',
      from: 'function:src-services-conteoservice-js:useCerrarSesion',
      to: 'resource:rpc:cerrar-conteo-sesion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:483',
      from: 'function:src-services-conteoservice-js:useConteos',
      to: 'resource:table:tms-conteos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:484',
      from: 'function:src-services-conteoservice-js:useRegistrarConteo',
      to: 'resource:rpc:registrar-conteo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:485',
      from: 'function:src-services-conteoservice-js:useEditarConteo',
      to: 'resource:rpc:editar-conteo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:486',
      from: 'function:src-services-conteoservice-js:useEliminarConteo',
      to: 'resource:rpc:eliminar-conteo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:487',
      from: 'function:src-services-conteoservice-js:useConciliacion',
      to: 'resource:rpc:conteo-conciliacion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:488',
      from: 'function:src-services-conteoservice-js:useAjusteErp',
      to: 'resource:rpc:conteo-ajuste-erp',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:489',
      from: 'function:src-services-conteoservice-js:useBloques',
      to: 'resource:table:tms-conteo-bloques',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:490',
      from: 'function:src-services-conteoservice-js:useBloque',
      to: 'resource:table:tms-conteo-bloques',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:491',
      from: 'function:src-services-conteoservice-js:useBloque',
      to: 'resource:table:tms-conteo-bloque-items',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:492',
      from: 'function:src-services-conteoservice-js:useBloque',
      to: 'resource:table:tms-conteo-auditorias',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:493',
      from: 'function:src-services-conteoservice-js:useCrearBloque',
      to: 'resource:rpc:crear-conteo-bloque',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:494',
      from: 'function:src-services-conteoservice-js:useEditarBloque',
      to: 'resource:rpc:editar-conteo-bloque',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:495',
      from: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      to: 'resource:rpc:agregar-conteo-bloque-item',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:496',
      from: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      to: 'resource:rpc:eliminar-conteo-bloque-item',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:497',
      from: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      to: 'resource:rpc:registrar-conteo-auditoria',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:498',
      from: 'function:src-services-conteoservice-js:useProyecciones',
      to: 'resource:table:tms-conteo-proyecciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:499',
      from: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      to: 'resource:rpc:guardar-conteo-proyeccion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:500',
      from: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      to: 'resource:rpc:eliminar-conteo-proyeccion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:501',
      from: 'function:src-services-conteoservice-js:useGuardarCosto',
      to: 'resource:rpc:guardar-conteo-costo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:502',
      from: 'function:src-services-downloadservice-js:downloadPdfDocument',
      to: 'function:src-services-downloadservice-js:saveReportBlob',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:503',
      from: 'function:src-services-eventosservice-js:listarEventos',
      to: 'resource:table:dominio-eventos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:504',
      from: 'function:src-services-eventosservice-js:listarReglas',
      to: 'resource:table:notificacion-regla',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:505',
      from: 'function:src-services-eventosservice-js:listarBandeja',
      to: 'resource:table:notificacion',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:506',
      from: 'function:src-services-eventosservice-js:despacharPush',
      to: 'edge:notify-inventario',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:507',
      from: 'function:src-services-eventosservice-js:despacharPush',
      to: 'resource:rpc:notif-marcar-enviadas',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:508',
      from: 'function:src-services-eventosservice-js:despacharPush',
      to: 'resource:table:notificacion',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:509',
      from: 'function:src-services-flujoservice-js:obtenerFlujo',
      to: 'resource:table:tms-flujo-modelos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:510',
      from: 'function:src-services-flujoservice-js:guardarFlujo',
      to: 'resource:rpc:flujo-guardar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:511',
      from: 'function:src-services-insumosservice-js:listarInsumos',
      to: 'resource:table:tms-insumos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:512',
      from: 'function:src-services-insumosservice-js:setCantidad',
      to: 'resource:rpc:insumos-set-cantidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:513',
      from: 'function:src-services-insumosservice-js:guardarInsumo',
      to: 'resource:rpc:insumos-guardar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:514',
      from: 'function:src-services-insumosservice-js:eliminarInsumo',
      to: 'resource:rpc:insumos-eliminar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:515',
      from: 'function:src-services-insumosservice-js:armarCorreoSolicitud',
      to: 'function:src-services-insumosservice-js:semaforo',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:516',
      from: 'function:src-services-mobileservice-js:initOTAUpdates',
      to: 'resource:rpc:registrar-ota-aplicado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:517',
      from: 'function:src-services-mobileservice-js:versionOTA',
      to: 'resource:rpc:registrar-ota-aplicado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:518',
      from: 'function:src-services-mobileservice-js:initPushNotifications',
      to: 'resource:table:tms-usuarios',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:519',
      from: 'function:src-services-otadeployservice-js:listarDespliegueOTA',
      to: 'edge:ota-deploy',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:520',
      from: 'function:src-services-otadeployservice-js:promoverOTA',
      to: 'edge:ota-deploy',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:521',
      from: 'function:src-services-otadeployservice-js:eliminarBundleOTA',
      to: 'edge:ota-deploy',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:522',
      from: 'function:src-services-otadeployservice-js:obtenerGobernanzaOTA',
      to: 'resource:table:tms-ota-gobernanza',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:523',
      from: 'function:src-services-otadeployservice-js:guardarGobernanzaOTA',
      to: 'resource:rpc:ota-gobernanza-set',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:524',
      from: 'function:src-services-otadeployservice-js:resumenDispositivosOTA',
      to: 'function:src-services-otadeployservice-js:listarDespliegueOTA',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:525',
      from: 'function:src-services-otadeployservice-js:historialOTA',
      to: 'resource:rpc:ota-historial',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:526',
      from: 'function:src-services-otadeployservice-js:avisarNuevaVersionPush',
      to: 'edge:notify-inventario',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:527',
      from: 'function:src-services-otadeployservice-js:limpiarBundlesViejos',
      to: 'function:src-services-otadeployservice-js:eliminarBundleOTA',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:528',
      from: 'function:src-services-panelptm-js:fetchNvPanel',
      to: 'function:src-services-panelptm-js:mapNvPanel',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:529',
      from: 'function:src-services-postventaservice-js:pvFolioCls',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'invoca',
      label: 'invoca función'
    },
    {
      id: 'connection:530',
      from: 'function:src-services-postventaservice-js:useTecnicos',
      to: 'resource:table:tms-postventa-tecnicos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:531',
      from: 'function:src-services-postventaservice-js:useGuardarTecnico',
      to: 'resource:rpc:guardar-pv-tecnico',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:532',
      from: 'function:src-services-postventaservice-js:useEliminarTecnico',
      to: 'resource:rpc:eliminar-pv-tecnico',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:533',
      from: 'function:src-services-postventaservice-js:useTickets',
      to: 'resource:table:tms-postventa-tickets',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:534',
      from: 'function:src-services-postventaservice-js:useCrearTicket',
      to: 'resource:rpc:crear-pv-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:535',
      from: 'function:src-services-postventaservice-js:useActualizarTicket',
      to: 'resource:rpc:actualizar-pv-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:536',
      from: 'function:src-services-postventaservice-js:useEliminarTicket',
      to: 'resource:rpc:eliminar-pv-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:537',
      from: 'function:src-services-postventaservice-js:useEliminarCorreo',
      to: 'resource:rpc:eliminar-pv-correo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:538',
      from: 'function:src-services-postventaservice-js:useReasociarCorreo',
      to: 'resource:rpc:reasociar-pv-correo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:539',
      from: 'function:src-services-postventaservice-js:useAvanzarTicket',
      to: 'resource:rpc:avanzar-pv-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:540',
      from: 'function:src-services-postventaservice-js:useCerrarTicket',
      to: 'resource:rpc:cerrar-pv-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:541',
      from: 'function:src-services-postventaservice-js:usePvHistorial',
      to: 'resource:rpc:pv-historial',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:542',
      from: 'function:src-services-postventaservice-js:useCorreosTicket',
      to: 'resource:rpc:pv-correos-ticket',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:543',
      from: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      to: 'resource:rpc:pv-informe-calidad',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:544',
      from: 'function:src-services-postventaservice-js:useFamiliasStock',
      to: 'resource:rpc:pv-familias-stock',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:545',
      from: 'function:src-services-postventaservice-js:usePvDashboard',
      to: 'resource:rpc:pv-dashboard',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:546',
      from: 'function:src-services-securityservice-js:estadoMFA',
      to: 'resource:rpc:iam-mfa-estado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:547',
      from: 'function:src-services-securityservice-js:verificarTOTP',
      to: 'resource:rpc:iam-mfa-sync',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:548',
      from: 'function:src-services-securityservice-js:quitarFactor',
      to: 'resource:rpc:iam-mfa-sync',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:549',
      from: 'function:src-services-tmsservice-js:listarOrdenes',
      to: 'resource:table:tms-transporte-ordenes',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:550',
      from: 'function:src-services-tmsservice-js:listarVehiculos',
      to: 'resource:table:tms-vehiculos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:551',
      from: 'function:src-services-tmsservice-js:listarConductores',
      to: 'resource:table:tms-conductores',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:552',
      from: 'function:src-services-tmsservice-js:listarIncidencias',
      to: 'resource:table:tms-transporte-incidencias',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:553',
      from: 'function:src-services-tmsservice-js:crearOrdenDesdeNV',
      to: 'resource:rpc:tms-orden-crear-desde-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:554',
      from: 'function:src-services-tmsservice-js:asignarOrden',
      to: 'resource:rpc:tms-orden-asignar',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:555',
      from: 'function:src-services-tmsservice-js:transicionOrden',
      to: 'resource:rpc:tms-orden-transicion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:556',
      from: 'function:src-services-tmsservice-js:registrarPOD',
      to: 'resource:rpc:tms-orden-pod',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:557',
      from: 'function:src-services-tmsservice-js:crearIncidencia',
      to: 'resource:rpc:tms-incidencia-crear',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:558',
      from: 'function:src-services-tmsservice-js:resolverIncidencia',
      to: 'resource:rpc:tms-incidencia-resolver',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:559',
      from: 'function:src-services-tmsservice-js:miConductorId',
      to: 'resource:table:tms-usuarios',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:560',
      from: 'function:src-services-tmsservice-js:miConductorId',
      to: 'resource:table:tms-conductores',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:561',
      from: 'function:src-services-workflowservice-js:listarDefiniciones',
      to: 'resource:table:workflow-definition',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:562',
      from: 'function:src-services-workflowservice-js:listarEstados',
      to: 'resource:table:workflow-state',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:563',
      from: 'function:src-services-workflowservice-js:listarTransiciones',
      to: 'resource:table:workflow-transition',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:564',
      from: 'function:src-services-workflowservice-js:listarHistorial',
      to: 'resource:table:workflow-history',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:565',
      from: 'function:src-services-workflowservice-js:listarPermisos',
      to: 'resource:table:tms-permisos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:566',
      from: 'screen:admin-api',
      to: 'function:src-services-apiservice-js:listarApiKeys',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:567',
      from: 'screen:admin-api',
      to: 'function:src-services-apiservice-js:crearApiKey',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:568',
      from: 'screen:admin-api',
      to: 'function:src-services-apiservice-js:revocarApiKey',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:569',
      from: 'screen:admin-api',
      to: 'function:src-services-apiservice-js:listarApiLog',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:570',
      from: 'module:admin',
      to: 'component:src-pages-admin-auditoria-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:571',
      from: 'component:src-pages-admin-auditoria-jsx',
      to: 'function:src-services-iamservice-js:auditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:572',
      from: 'component:src-pages-admin-auditoria-jsx',
      to: 'function:src-services-iamservice-js:auditoriaMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:573',
      from: 'screen:admin-bodegas-softland',
      to: 'function:src-services-calidadservice-js:useBodegasSoftland',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:574',
      from: 'screen:admin-bodegas-softland',
      to: 'function:src-services-calidadservice-js:useGuardarBodegaSoftland',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:575',
      from: 'screen:admin-bodegas-softland',
      to: 'function:src-services-calidadservice-js:useEliminarBodegaSoftland',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:576',
      from: 'module:admin',
      to: 'component:src-pages-admin-delegaciones-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:577',
      from: 'component:src-pages-admin-delegaciones-jsx',
      to: 'function:src-services-iamservice-js:delegaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:578',
      from: 'component:src-pages-admin-delegaciones-jsx',
      to: 'function:src-services-iamservice-js:delegar',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:579',
      from: 'component:src-pages-admin-delegaciones-jsx',
      to: 'function:src-services-iamservice-js:revocarDelegacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:580',
      from: 'component:src-pages-admin-delegaciones-jsx',
      to: 'function:src-services-iamservice-js:catalogoScope',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:581',
      from: 'module:admin',
      to: 'component:src-pages-admin-escala-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:582',
      from: 'component:src-pages-admin-escala-jsx',
      to: 'function:src-services-iamservice-js:permisosStats',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:583',
      from: 'component:src-pages-admin-escala-jsx',
      to: 'function:src-services-iamservice-js:refrescarPermisos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:584',
      from: 'component:src-pages-admin-escala-jsx',
      to: 'function:src-services-iamservice-js:bulkUsuarios',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:585',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:listarEventos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:586',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:listarReglas',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:587',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:guardarRegla',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:588',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:eliminarRegla',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:589',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:listarBandeja',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:590',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:misNotificaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:591',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:marcarLeida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:592',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:marcarTodasLeidas',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:593',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:despacharPush',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:594',
      from: 'screen:admin-eventos',
      to: 'function:src-services-eventosservice-js:metricasProceso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:595',
      from: 'module:admin',
      to: 'component:src-pages-admin-historialacceso-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:596',
      from: 'component:src-pages-admin-historialacceso-jsx',
      to: 'function:src-services-iamservice-js:historialAcceso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:597',
      from: 'component:src-pages-admin-historialacceso-jsx',
      to: 'function:src-services-iamservice-js:historialAccesoResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:598',
      from: 'module:admin',
      to: 'component:src-pages-admin-politicas-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:599',
      from: 'component:src-pages-admin-politicas-jsx',
      to: 'function:src-services-iamservice-js:listarPolicies',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:600',
      from: 'component:src-pages-admin-politicas-jsx',
      to: 'function:src-services-iamservice-js:guardarPolicy',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:601',
      from: 'component:src-pages-admin-politicas-jsx',
      to: 'function:src-services-iamservice-js:togglePolicy',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:602',
      from: 'component:src-pages-admin-politicas-jsx',
      to: 'function:src-services-iamservice-js:probarEditarNV',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:603',
      from: 'component:src-pages-admin-politicas-jsx',
      to: 'function:src-services-iamservice-js:catalogoScope',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:604',
      from: 'module:admin',
      to: 'component:src-pages-admin-scopes-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:605',
      from: 'component:src-pages-admin-scopes-jsx',
      to: 'function:src-services-iamservice-js:catalogoScope',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:606',
      from: 'component:src-pages-admin-scopes-jsx',
      to: 'function:src-services-iamservice-js:listarAsignaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:607',
      from: 'component:src-pages-admin-scopes-jsx',
      to: 'function:src-services-iamservice-js:asignarScope',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:608',
      from: 'component:src-pages-admin-scopes-jsx',
      to: 'function:src-services-iamservice-js:revocarAsignacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:609',
      from: 'module:admin',
      to: 'component:src-pages-admin-sesiones-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:610',
      from: 'component:src-pages-admin-sesiones-jsx',
      to: 'function:src-services-iamservice-js:sesiones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:611',
      from: 'component:src-pages-admin-sesiones-jsx',
      to: 'function:src-services-iamservice-js:forzarLogout',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:612',
      from: 'module:admin',
      to: 'component:src-pages-admin-teams-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:613',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:catalogoOrg',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:614',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:listarTeams',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:615',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:guardarTeam',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:616',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:eliminarTeam',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:617',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:miembrosTeam',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:618',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:agregarMiembroTeam',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:619',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:quitarMiembroTeam',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:620',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:listarGroups',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:621',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:guardarGroup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:622',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:eliminarGroup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:623',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:miembrosGroup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:624',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:agregarMiembroGroup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:625',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:quitarMiembroGroup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:626',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:asignacionesPrincipal',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:627',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:asignarRolPrincipal',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:628',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:revocarAsignacionPrincipal',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:629',
      from: 'component:src-pages-admin-teams-jsx',
      to: 'function:src-services-iamservice-js:refrescarGruposDinamicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:630',
      from: 'module:admin',
      to: 'component:src-pages-admin-users-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:631',
      from: 'component:src-pages-admin-users-jsx',
      to: 'function:src-services-iamservice-js:listarAsignaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:632',
      from: 'component:src-pages-admin-users-jsx',
      to: 'function:src-services-iamservice-js:refrescarPermisos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:633',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:listarDefiniciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:634',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:listarEstados',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:635',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:listarTransiciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:636',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:listarHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:637',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:listarPermisos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:638',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:guardarDefinicion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:639',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:eliminarDefinicion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:640',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:guardarEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:641',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:eliminarEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:642',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:guardarTransicion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:643',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:eliminarTransicion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:644',
      from: 'screen:admin-workflows',
      to: 'function:src-services-workflowservice-js:accionesDisponibles',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:645',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:646',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:647',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:648',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:649',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:650',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:651',
      from: 'screen:inventory-analisis',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:652',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:653',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:654',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:655',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:656',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:657',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:658',
      from: 'screen:inventory-analisis-tab-antiguos-disp',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:659',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:660',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:661',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:662',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:663',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:664',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:665',
      from: 'screen:inventory-analisis-tab-no-activos-stock',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:666',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:667',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:668',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:669',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:670',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:671',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:672',
      from: 'screen:inventory-analisis-tab-duplicados',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:673',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:674',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:675',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:676',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:677',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:678',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:679',
      from: 'screen:inventory-analisis-tab-anomalias',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:680',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:useAnalisisResumen',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:681',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:useAnalisisCodigos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:682',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:useCargarActivo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:683',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:parseActivoFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:684',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:useCargarStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:685',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:parseStockFile',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:686',
      from: 'screen:inventory-analisis-tab-detalle',
      to: 'function:src-services-analisisservice-js:useEnviarEmil',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:687',
      from: 'module:inventario',
      to: 'component:src-pages-inventory-bloquedetalle-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:688',
      from: 'component:src-pages-inventory-bloquedetalle-jsx',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:689',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:690',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:691',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:692',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:693',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:694',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:695',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:696',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:697',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:698',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:699',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:700',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:701',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:702',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:703',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:704',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:705',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:706',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:707',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:708',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:709',
      from: 'screen:inventory-conteo',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:710',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:711',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:712',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:713',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:714',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:715',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:716',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:717',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:718',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:719',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:720',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:721',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:722',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:723',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:724',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:725',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:726',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:727',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:728',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:729',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:730',
      from: 'screen:inventory-conteo-tab-sesiones',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:731',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:732',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:733',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:734',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:735',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:736',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:737',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:738',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:739',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:740',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:741',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:742',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:743',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:744',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:745',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:746',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:747',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:748',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:749',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:750',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:751',
      from: 'screen:inventory-conteo-tab-conciliacion',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:752',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:753',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:754',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:755',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:756',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:757',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:758',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:759',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:760',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:761',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:762',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:763',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:764',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:765',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:766',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:767',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:768',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:769',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:770',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:771',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:772',
      from: 'screen:inventory-conteo-tab-ajuste',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:773',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:774',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:775',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:776',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:777',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:778',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:779',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:780',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:781',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:782',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:783',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:784',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:785',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:786',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:787',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:788',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:789',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:790',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:791',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:792',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:793',
      from: 'screen:inventory-conteo-tab-bloques',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:794',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:795',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:796',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useCerrarSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:797',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useConciliacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:798',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useAjusteErp',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:799',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:resumenAnalisis',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:800',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useBloques',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:801',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:802',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useCrearBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:803',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useEditarBloque',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:804',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useAgregarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:805',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useEliminarBloqueItem',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:806',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useRegistrarAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:807',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useProyecciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:808',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useGuardarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:809',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useEliminarProyeccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:810',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:811',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:812',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:813',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:conteoStockSistema',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:814',
      from: 'screen:inventory-conteo-tab-proyeccion',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:815',
      from: 'screen:inventory-insumos',
      to: 'function:src-services-insumosservice-js:listarInsumos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:816',
      from: 'screen:inventory-insumos',
      to: 'function:src-services-insumosservice-js:setCantidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:817',
      from: 'screen:inventory-insumos',
      to: 'function:src-services-insumosservice-js:guardarInsumo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:818',
      from: 'screen:inventory-insumos',
      to: 'function:src-services-insumosservice-js:semaforo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:819',
      from: 'screen:inventory-insumos',
      to: 'function:src-services-insumosservice-js:armarCorreoSolicitud',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:820',
      from: 'screen:login',
      to: 'function:src-services-securityservice-js:nivelAAL',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:821',
      from: 'screen:login',
      to: 'function:src-services-securityservice-js:factoresVerificados',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:822',
      from: 'screen:login',
      to: 'function:src-services-securityservice-js:verificarTOTP',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:823',
      from: 'module:inventario',
      to: 'component:src-pages-mobile-conteopda-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:824',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:useSesionesConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:825',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:useCrearSesion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:826',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:useConteos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:827',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:useRegistrarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:828',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:useEliminarConteo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:829',
      from: 'component:src-pages-mobile-conteopda-jsx',
      to: 'function:src-services-conteoservice-js:estadoConteoMeta',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:830',
      from: 'module:panel',
      to: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:831',
      from: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:832',
      from: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      to: 'function:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:833',
      from: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      to: 'function:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:834',
      from: 'component:src-pages-panel-builder-components-camposcalculados-jsx',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchDashboards',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:835',
      from: 'screen:panel-builder',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchDashboards',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:836',
      from: 'screen:panel-builder',
      to: 'function:src-pages-panel-builder-builderservice-js:saveDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:837',
      from: 'screen:panel-builder',
      to: 'function:src-pages-panel-builder-builderservice-js:deleteDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:838',
      from: 'screen:panel-builder',
      to: 'function:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:839',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:fetchTransportistas',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:840',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:saveTransportista',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:841',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:toggleTransportista',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:842',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:deleteTransportista',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:843',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:fetchVendedores',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:844',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:saveVendedor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:845',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:toggleVendedor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:846',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:deleteVendedor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:847',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:fetchAuditoria',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:848',
      from: 'screen:panel-configuracion',
      to: 'function:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:849',
      from: 'module:panel',
      to: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:850',
      from: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:851',
      from: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:852',
      from: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:853',
      from: 'component:src-pages-panel-ingresar-components-consolidados-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarNvBasico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:854',
      from: 'module:panel',
      to: 'component:src-pages-panel-ingresar-components-formnv-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:855',
      from: 'component:src-pages-panel-ingresar-components-formnv-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:colorFor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:856',
      from: 'module:panel',
      to: 'component:src-pages-panel-reaperturas-bandejareaperturas-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:857',
      from: 'component:src-pages-panel-reaperturas-bandejareaperturas-jsx',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:858',
      from: 'component:src-pages-panel-reaperturas-bandejareaperturas-jsx',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:859',
      from: 'component:src-pages-panel-reaperturas-bandejareaperturas-jsx',
      to: 'function:src-pages-panel-reaperturas-reopenrequestsservice-js:subscribeToReopenRequests',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:860',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:colorFor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:861',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listaActivas',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:862',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:863',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:opciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:864',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookup',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:865',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupById',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:866',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:guardar',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:867',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:868',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:exportarOperaciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:869',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:esClienteOrange',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:870',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:lookupOrangeAssociation',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:871',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:buscarOperacionesUltraLocal',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:872',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:fusionarResultadosBusqueda',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:873',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:874',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:875',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:876',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:877',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:878',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:879',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:880',
      from: 'screen:panel-ingresar',
      to: 'function:src-pages-panel-config-configservice-js:fetchVendedores',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:881',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:882',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:883',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:884',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:885',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:886',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:887',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:888',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:889',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:890',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:891',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:892',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:893',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:894',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:895',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:896',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:897',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:898',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:899',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:900',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:901',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:902',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:903',
      from: 'screen:postventa-tickets',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:904',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:905',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:906',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:907',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:908',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:909',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:910',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:911',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:912',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:913',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:914',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:915',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:916',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:917',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:918',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:919',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:920',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:921',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:922',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:923',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:924',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:925',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:926',
      from: 'screen:postventa-tickets-tab-bandeja',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:927',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:928',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:929',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:930',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:931',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:932',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:933',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:934',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:935',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:936',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:937',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:938',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:939',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:940',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:941',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:942',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:943',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:944',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:945',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:946',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:947',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:948',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:949',
      from: 'screen:postventa-tickets-tab-calendario',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:950',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:951',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:952',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:953',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:954',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:955',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:956',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:957',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:958',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:959',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:960',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:961',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:962',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:963',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:964',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:965',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:966',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:967',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:968',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:969',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:970',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:971',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:972',
      from: 'screen:postventa-tickets-tab-nuevo',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:973',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:974',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:975',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:976',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:977',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:978',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:979',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:980',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:981',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:982',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:983',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:984',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:985',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:986',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:987',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:988',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:989',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:990',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:991',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:992',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:993',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:994',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:995',
      from: 'screen:postventa-tickets-tab-dashboard',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:996',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:997',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:pvSiguienteEstado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:998',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:pvEstadoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:999',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:pvPrioridadCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1000',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:pvTipoCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1001',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:pvFolioCls',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1002',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useTecnicos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1003',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useGuardarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1004',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useEliminarTecnico',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1005',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useTickets',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1006',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useCrearTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1007',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useActualizarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1008',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:usePvDashboard',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1009',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useFamiliasStock',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1010',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useCorreosTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1011',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:esCorreoInterno',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1012',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useEliminarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1013',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useEliminarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1014',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useReasociarCorreo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1015',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useAvanzarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1016',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useCerrarTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1017',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:usePvHistorial',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1018',
      from: 'screen:postventa-tickets-tab-tecnicos',
      to: 'function:src-services-postventaservice-js:useInformeCalidadTicket',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1019',
      from: 'module:public',
      to: 'component:src-pages-public-rendicionpublica-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1020',
      from: 'component:src-pages-public-rendicionpublica-jsx',
      to: 'function:src-services-rendicionesservice-js:optimizePhoto',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1021',
      from: 'screen:quality-acciones',
      to: 'function:src-services-calidadservice-js:useAccionesCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1022',
      from: 'screen:quality-acciones',
      to: 'function:src-services-calidadservice-js:useAreasCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1023',
      from: 'screen:quality-acciones',
      to: 'function:src-services-calidadservice-js:useResolverAccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1024',
      from: 'screen:quality-acciones',
      to: 'function:src-services-calidadservice-js:useAnularAccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1025',
      from: 'module:quality',
      to: 'component:src-pages-quality-accionintegracion-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1026',
      from: 'component:src-pages-quality-accionintegracion-jsx',
      to: 'function:src-services-calidadservice-js:useAccionATicketPv',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1027',
      from: 'component:src-pages-quality-accionintegracion-jsx',
      to: 'function:src-services-calidadservice-js:useAccionReferencia',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1028',
      from: 'module:quality',
      to: 'component:src-pages-quality-asignacionescalidad-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1029',
      from: 'component:src-pages-quality-asignacionescalidad-jsx',
      to: 'function:src-services-calidadservice-js:fetchCandidatos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1030',
      from: 'component:src-pages-quality-asignacionescalidad-jsx',
      to: 'function:src-services-calidadservice-js:useAsignacionesCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1031',
      from: 'component:src-pages-quality-asignacionescalidad-jsx',
      to: 'function:src-services-calidadservice-js:useCrearAsignacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1032',
      from: 'component:src-pages-quality-asignacionescalidad-jsx',
      to: 'function:src-services-calidadservice-js:useAnularAsignacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1033',
      from: 'component:src-pages-quality-asignacionescalidad-jsx',
      to: 'function:src-services-calidadservice-js:useEliminarAsignacionCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1034',
      from: 'module:quality',
      to: 'component:src-pages-quality-checklistingreso-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1035',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:useTareasChecklist',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1036',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:useGuardarChecklist',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1037',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:useFirmarCertificado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1038',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:useCategoriasTarea',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1039',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:useEliminarTareaCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1040',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:riesgoIngreso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1041',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:indicadoresIso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1042',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:uploadEvidenciaIngreso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1043',
      from: 'component:src-pages-quality-checklistingreso-jsx',
      to: 'function:src-services-calidadservice-js:deleteEvidenciaSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1044',
      from: 'screen:quality-clasificacion',
      to: 'function:src-services-calidadservice-js:cargarClasificacionGrupos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1045',
      from: 'screen:quality-clasificacion',
      to: 'function:src-services-calidadservice-js:reclasificarRecepciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1046',
      from: 'screen:quality-bandeja',
      to: 'function:src-services-calidadservice-js:useAccionesCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1047',
      from: 'screen:quality-bandeja',
      to: 'function:src-services-calidadservice-js:useAreasCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1048',
      from: 'screen:quality-bandeja',
      to: 'function:src-services-calidadservice-js:useResolverAccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1049',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useInformes',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1050',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useInformeItems',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1051',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useCrearInforme',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1052',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useActualizarEstadoInforme',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1053',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useActualizarInforme',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1054',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useEliminarInforme',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1055',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useDictaminar',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1056',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:fetchCandidatos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1057',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useGuardarInformeDanos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1058',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useInformeEvidencias',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1059',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:marcarPreliminarCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1060',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:fetchLotesSeries',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1061',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:notificarInventarioPush',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1062',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:notificarDictamenPush',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1063',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useCrearAccion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1064',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useAreasCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1065',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useBodegasDestino',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1066',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:tomarAsignacionCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1067',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:guardarProgresoAsignacionCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1068',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:liberarAsignacionCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1069',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useTareasPendientesCount',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1070',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useAsignacionesPendientesCount',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1071',
      from: 'screen:quality-monitoreo',
      to: 'function:src-services-calidadservice-js:useSalidaPendientesCount',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1072',
      from: 'module:quality',
      to: 'component:src-pages-quality-salidacertificacion-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1073',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:useTareasSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1074',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:useCrearTareaSalidaManual',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1075',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:useGuardarChecklist',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1076',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:useFirmarCertificado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1077',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:fetchCandidatosSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1078',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:useEliminarTareaCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1079',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:resultadoPeso',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1080',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:semaforoSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1081',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:uploadEvidenciaSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1082',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-calidadservice-js:deleteEvidenciaSalida',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1083',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-services-panelptm-js:fetchNvPanel',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1084',
      from: 'component:src-pages-quality-salidacertificacion-jsx',
      to: 'function:src-pages-panel-ingresar-ingresarservice-js:opciones',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1085',
      from: 'module:quality',
      to: 'component:src-pages-quality-trazabilidadmodal-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1086',
      from: 'component:src-pages-quality-trazabilidadmodal-jsx',
      to: 'function:src-services-calidadservice-js:useTrazabilidadProducto',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1087',
      from: 'screen:seguridad',
      to: 'function:src-services-securityservice-js:estadoMFA',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1088',
      from: 'screen:seguridad',
      to: 'function:src-services-securityservice-js:enrolarTOTP',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1089',
      from: 'screen:seguridad',
      to: 'function:src-services-securityservice-js:verificarTOTP',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1090',
      from: 'screen:seguridad',
      to: 'function:src-services-securityservice-js:quitarFactor',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1091',
      from: 'screen:seguridad',
      to: 'function:src-services-iamservice-js:misCoberturas',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1092',
      from: 'screen:seguridad',
      to: 'function:src-services-iamservice-js:usuariosLite',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1093',
      from: 'screen:seguridad',
      to: 'function:src-services-iamservice-js:delegar',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1094',
      from: 'screen:seguridad',
      to: 'function:src-services-iamservice-js:revocarDelegacion',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1095',
      from: 'screen:tms-pda',
      to: 'function:src-services-tmsservice-js:listarOrdenes',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1096',
      from: 'screen:tms-pda',
      to: 'function:src-services-tmsservice-js:transicionOrden',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1097',
      from: 'screen:tms-pda',
      to: 'function:src-services-tmsservice-js:miConductorId',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1098',
      from: 'module:tms',
      to: 'component:src-pages-tms-podcapture-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1099',
      from: 'component:src-pages-tms-podcapture-jsx',
      to: 'function:src-services-tmsservice-js:subirEvidencia',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1100',
      from: 'component:src-pages-tms-podcapture-jsx',
      to: 'function:src-services-tmsservice-js:registrarPOD',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1101',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:listarOrdenes',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1102',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:listarVehiculos',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1103',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:listarConductores',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1104',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:listarIncidencias',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1105',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:crearOrdenDesdeNV',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1106',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:asignarOrden',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1107',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:transicionOrden',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1108',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:crearIncidencia',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1109',
      from: 'screen:tms-control',
      to: 'function:src-services-tmsservice-js:resolverIncidencia',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1110',
      from: 'screen:admin-flujo-maestro',
      to: 'function:src-services-flujoservice-js:obtenerFlujo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1111',
      from: 'screen:admin-flujo-maestro',
      to: 'function:src-services-flujoservice-js:guardarFlujo',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1112',
      from: 'screen:inventory-traspasos',
      to: 'function:src-services-calidadservice-js:useAccionesCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1113',
      from: 'screen:inventory-traspasos',
      to: 'function:src-services-calidadservice-js:useAreasCalidad',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1114',
      from: 'screen:inventory-traspasos',
      to: 'function:src-services-calidadservice-js:useAccionCorreoEnviado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1115',
      from: 'screen:verificar',
      to: 'function:src-services-calidadservice-js:verificarCertificado',
      relation: 'usa',
      label: 'usa función'
    },
    {
      id: 'connection:1116',
      from: 'screen:admin-monitor',
      to: 'action:src-pages-admin-adminmonitor-jsx:AdminMonitor',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1117',
      from: 'action:src-pages-admin-adminmonitor-jsx:AdminMonitor',
      to: 'resource:table:tms-usuarios',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1118',
      from: 'screen:admin-cleanup',
      to: 'action:src-pages-admin-cleanup-jsx:handleCleanup',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1119',
      from: 'action:src-pages-admin-cleanup-jsx:handleCleanup',
      to: 'resource:rpc:clean-operational-data',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1120',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:AccessConfigPanel',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1121',
      from: 'action:src-pages-admin-dataimport-jsx:AccessConfigPanel',
      to: 'resource:table:tms-roles',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1122',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:saveRole',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1123',
      from: 'action:src-pages-admin-dataimport-jsx:saveRole',
      to: 'resource:table:tms-roles',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1124',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:DataImport',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1125',
      from: 'action:src-pages-admin-dataimport-jsx:DataImport',
      to: 'resource:table:tms-roles',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1126',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:normNvVal',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1127',
      from: 'action:src-pages-admin-dataimport-jsx:normNvVal',
      to: 'resource:table:tms-nv-catalogo',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1128',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:hasVal',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1129',
      from: 'action:src-pages-admin-dataimport-jsx:hasVal',
      to: 'resource:table:tms-nv-eliminadas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1130',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:enrichWithProductInfo',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1131',
      from: 'action:src-pages-admin-dataimport-jsx:enrichWithProductInfo',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1132',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:handleUpload',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1133',
      from: 'action:src-pages-admin-dataimport-jsx:handleUpload',
      to: 'resource:rpc:nv-catalogo-purgar-canal',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1134',
      from: 'action:src-pages-admin-dataimport-jsx:handleUpload',
      to: 'resource:rpc:prepare-nv-import',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1135',
      from: 'screen:inbound-data-import',
      to: 'action:src-pages-admin-dataimport-jsx:runChunk',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1136',
      from: 'action:src-pages-admin-dataimport-jsx:runChunk',
      to: 'resource:rpc:bulk-upsert',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1137',
      from: 'action:src-pages-admin-dataimport-jsx:runChunk',
      to: 'resource:table:tms-historial-cargas',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1138',
      from: 'screen:admin-locations',
      to: 'action:src-pages-admin-locationmanager-jsx:LocationManager',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1139',
      from: 'action:src-pages-admin-locationmanager-jsx:LocationManager',
      to: 'resource:rpc:putaway-admin-resumen',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1140',
      from: 'screen:admin-locations',
      to: 'action:src-pages-admin-locationmanager-jsx:handleInlineSave',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1141',
      from: 'action:src-pages-admin-locationmanager-jsx:handleInlineSave',
      to: 'resource:rpc:mover-ubicacion-wms',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1142',
      from: 'screen:admin-locations',
      to: 'action:src-pages-admin-locationmanager-jsx:handleMove',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1143',
      from: 'action:src-pages-admin-locationmanager-jsx:handleMove',
      to: 'resource:rpc:mover-ubicacion-wms',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1144',
      from: 'screen:admin-locations',
      to: 'action:src-pages-admin-locationmanager-jsx:handleDelete',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1145',
      from: 'action:src-pages-admin-locationmanager-jsx:handleDelete',
      to: 'resource:rpc:eliminar-ubicacion-wms',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1146',
      from: 'screen:admin-location-requests',
      to: 'action:src-pages-admin-locationrequests-jsx:submit',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1147',
      from: 'action:src-pages-admin-locationrequests-jsx:submit',
      to: 'resource:rpc:resolver-cambio-ubicacion',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1148',
      from: 'screen:admin-location-requests',
      to: 'action:src-pages-admin-locationrequests-jsx:LocationRequests',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1149',
      from: 'action:src-pages-admin-locationrequests-jsx:LocationRequests',
      to: 'resource:table:wms-ubicacion-solicitudes',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1150',
      from: 'screen:admin-observability',
      to: 'action:src-pages-admin-observability-jsx:fetchObservabilitySnapshot',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1151',
      from: 'action:src-pages-admin-observability-jsx:fetchObservabilitySnapshot',
      to: 'resource:table:system-logs',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1152',
      from: 'action:src-pages-admin-observability-jsx:fetchObservabilitySnapshot',
      to: 'resource:table:system-alerts',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1153',
      from: 'screen:admin-observability',
      to: 'action:src-pages-admin-observability-jsx:Observability',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1154',
      from: 'action:src-pages-admin-observability-jsx:Observability',
      to: 'resource:rpc:update-system-alert-status',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1155',
      from: 'action:src-pages-admin-observability-jsx:Observability',
      to: 'resource:rpc:force-app-refresh',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1156',
      from: 'action:src-pages-admin-observability-jsx:Observability',
      to: 'action:src-pages-admin-observability-jsx:fetchObservabilitySnapshot',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1157',
      from: 'module:admin',
      to: 'component:src-pages-admin-roles-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1158',
      from: 'component:src-pages-admin-roles-jsx',
      to: 'action:src-pages-admin-roles-jsx:RolesPage',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1159',
      from: 'action:src-pages-admin-roles-jsx:RolesPage',
      to: 'resource:table:tms-roles',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1160',
      from: 'action:src-pages-admin-roles-jsx:RolesPage',
      to: 'resource:table:tms-usuarios',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1161',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:Tickets',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1162',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1163',
      from: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      to: 'resource:table:tms-tickets',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1164',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:handleStatusChange',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1165',
      from: 'action:src-pages-admin-tickets-jsx:handleStatusChange',
      to: 'resource:table:tms-tickets',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1166',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:handleRespond',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1167',
      from: 'action:src-pages-admin-tickets-jsx:handleRespond',
      to: 'resource:table:tms-tickets',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1168',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:handleCreate',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1169',
      from: 'action:src-pages-admin-tickets-jsx:handleCreate',
      to: 'resource:table:tms-tickets',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1170',
      from: 'screen:admin-tickets',
      to: 'action:src-pages-admin-tickets-jsx:handleDelete',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1171',
      from: 'action:src-pages-admin-tickets-jsx:handleDelete',
      to: 'resource:table:tms-tickets',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1172',
      from: 'action:src-pages-admin-tickets-jsx:Tickets',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1173',
      from: 'action:src-pages-admin-tickets-jsx:handleStatusChange',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1174',
      from: 'action:src-pages-admin-tickets-jsx:handleRespond',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1175',
      from: 'action:src-pages-admin-tickets-jsx:handleCreate',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1176',
      from: 'action:src-pages-admin-tickets-jsx:handleDelete',
      to: 'action:src-pages-admin-tickets-jsx:fetchTickets',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1177',
      from: 'screen:admin-upload-history',
      to: 'action:src-pages-admin-uploadhistory-jsx:UploadHistory',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1178',
      from: 'screen:admin-upload-history',
      to: 'action:src-pages-admin-uploadhistory-jsx:fetchHistory',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1179',
      from: 'action:src-pages-admin-uploadhistory-jsx:fetchHistory',
      to: 'resource:table:tms-historial-cargas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1180',
      from: 'action:src-pages-admin-uploadhistory-jsx:UploadHistory',
      to: 'action:src-pages-admin-uploadhistory-jsx:fetchHistory',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1181',
      from: 'component:src-pages-admin-users-jsx',
      to: 'action:src-pages-admin-users-jsx:UsersPage',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1182',
      from: 'action:src-pages-admin-users-jsx:UsersPage',
      to: 'resource:table:tms-roles',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1183',
      from: 'action:src-pages-admin-users-jsx:UsersPage',
      to: 'resource:table:tms-usuarios',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1184',
      from: 'component:src-pages-admin-users-jsx',
      to: 'action:src-pages-admin-users-jsx:debounced',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1185',
      from: 'action:src-pages-admin-users-jsx:debounced',
      to: 'resource:rpc:guardar-usuario',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1186',
      from: 'action:src-pages-admin-users-jsx:debounced',
      to: 'resource:rpc:eliminar-usuario-completo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1187',
      from: 'action:src-pages-admin-users-jsx:debounced',
      to: 'resource:rpc:usuarios-bulk',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1188',
      from: 'screen:admin-views',
      to: 'action:src-pages-admin-views-jsx:fetchData',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1189',
      from: 'action:src-pages-admin-views-jsx:fetchData',
      to: 'resource:table:tms-modules-config',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1190',
      from: 'action:src-pages-admin-views-jsx:fetchData',
      to: 'resource:table:tms-roles',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1191',
      from: 'screen:admin-views',
      to: 'action:src-pages-admin-views-jsx:handleToggleModule',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1192',
      from: 'action:src-pages-admin-views-jsx:handleToggleModule',
      to: 'resource:table:tms-modules-config',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1193',
      from: 'screen:admin-views',
      to: 'action:src-pages-admin-views-jsx:handleUpdateLandingPage',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1194',
      from: 'action:src-pages-admin-views-jsx:handleUpdateLandingPage',
      to: 'resource:table:tms-roles',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1195',
      from: 'action:src-pages-admin-views-jsx:handleToggleModule',
      to: 'action:src-pages-admin-views-jsx:fetchData',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1196',
      from: 'action:src-pages-admin-views-jsx:handleUpdateLandingPage',
      to: 'action:src-pages-admin-views-jsx:fetchData',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1197',
      from: 'action:src-pages-admin-views-jsx:handleUpdateLandingPage',
      to: 'action:src-pages-admin-views-jsx:handleToggleModule',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1198',
      from: 'screen:inbound-cubing',
      to: 'action:src-pages-inbound-cubingregistry-jsx:CubingRegistry',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1199',
      from: 'action:src-pages-inbound-cubingregistry-jsx:CubingRegistry',
      to: 'resource:table:anim-stagger',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1200',
      from: 'screen:inbound-cubing',
      to: 'action:src-pages-inbound-cubingregistry-jsx:fetchProduct',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1201',
      from: 'action:src-pages-inbound-cubingregistry-jsx:fetchProduct',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1202',
      from: 'action:src-pages-inbound-cubingregistry-jsx:fetchProduct',
      to: 'resource:table:tms-pesos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1203',
      from: 'screen:inbound-cubing',
      to: 'action:src-pages-inbound-cubingregistry-jsx:handleInputChange',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1204',
      from: 'action:src-pages-inbound-cubingregistry-jsx:handleInputChange',
      to: 'resource:table:tms-pesos',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1205',
      from: 'action:src-pages-inbound-cubingregistry-jsx:handleInputChange',
      to: 'resource:table:tms-cubicaje-historial',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1206',
      from: 'screen:inbound-entry',
      to: 'action:src-pages-inbound-entry-jsx:goOffline',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1207',
      from: 'action:src-pages-inbound-entry-jsx:goOffline',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1208',
      from: 'action:src-pages-inbound-entry-jsx:goOffline',
      to: 'resource:table:wms-ubicaciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1209',
      from: 'screen:inbound-entry',
      to: 'action:src-pages-inbound-entry-jsx:handleUbicacionBlur',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1210',
      from: 'action:src-pages-inbound-entry-jsx:handleUbicacionBlur',
      to: 'resource:table:wms-ubicaciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1211',
      from: 'screen:inbound-entry',
      to: 'action:src-pages-inbound-entry-jsx:buildVisualLocationRows',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1212',
      from: 'action:src-pages-inbound-entry-jsx:buildVisualLocationRows',
      to: 'resource:rpc:registrar-putaway-ubicaciones',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1213',
      from: 'action:src-pages-inbound-entry-jsx:buildVisualLocationRows',
      to: 'resource:table:tms-historial-cargas',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1214',
      from: 'screen:inbound-reception',
      to: 'action:src-pages-inbound-reception-jsx:insertRecepcionItemsInChunks',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1215',
      from: 'action:src-pages-inbound-reception-jsx:insertRecepcionItemsInChunks',
      to: 'resource:table:tms-recepcion-items',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1216',
      from: 'screen:inbound-reception',
      to: 'action:src-pages-inbound-reception-jsx:fetchRecepcionItemsAll',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1217',
      from: 'action:src-pages-inbound-reception-jsx:fetchRecepcionItemsAll',
      to: 'resource:table:tms-recepcion-items',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1218',
      from: 'screen:inbound-reception',
      to: 'action:src-pages-inbound-reception-jsx:normSerie',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1219',
      from: 'action:src-pages-inbound-reception-jsx:normSerie',
      to: 'resource:table:tms-recepciones',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1220',
      from: 'action:src-pages-inbound-reception-jsx:normSerie',
      to: 'resource:table:tms-recepcion-items',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1221',
      from: 'screen:inbound-reception',
      to: 'action:src-pages-inbound-reception-jsx:deleteRecepcion',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1222',
      from: 'action:src-pages-inbound-reception-jsx:deleteRecepcion',
      to: 'resource:rpc:eliminar-recepcion-completa',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1223',
      from: 'screen:inbound-reception',
      to: 'action:src-pages-inbound-reception-jsx:lookupDescription',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1224',
      from: 'action:src-pages-inbound-reception-jsx:lookupDescription',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1225',
      from: 'action:src-pages-inbound-reception-jsx:normSerie',
      to: 'action:src-pages-inbound-reception-jsx:insertRecepcionItemsInChunks',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1226',
      from: 'screen:inbound-reception-nacional',
      to: 'action:src-pages-inbound-receptionnacional-jsx:insertRecepcionItemsNacionalesInChunks',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1227',
      from: 'action:src-pages-inbound-receptionnacional-jsx:insertRecepcionItemsNacionalesInChunks',
      to: 'resource:table:tms-recepcion-items-nacionales',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1228',
      from: 'screen:inbound-reception-nacional',
      to: 'action:src-pages-inbound-receptionnacional-jsx:fetchRecepcionItemsNacionalesAll',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1229',
      from: 'action:src-pages-inbound-receptionnacional-jsx:fetchRecepcionItemsNacionalesAll',
      to: 'resource:table:tms-recepcion-items-nacionales',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1230',
      from: 'screen:inbound-reception-nacional',
      to: 'action:src-pages-inbound-receptionnacional-jsx:normSerie',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1231',
      from: 'action:src-pages-inbound-receptionnacional-jsx:normSerie',
      to: 'resource:table:tms-recepciones-nacionales',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1232',
      from: 'action:src-pages-inbound-receptionnacional-jsx:normSerie',
      to: 'resource:table:tms-recepcion-items-nacionales',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1233',
      from: 'screen:inbound-reception-nacional',
      to: 'action:src-pages-inbound-receptionnacional-jsx:deleteRecepcion',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1234',
      from: 'action:src-pages-inbound-receptionnacional-jsx:deleteRecepcion',
      to: 'resource:rpc:eliminar-recepcion-completa',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1235',
      from: 'screen:inbound-reception-nacional',
      to: 'action:src-pages-inbound-receptionnacional-jsx:lookupDescription',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1236',
      from: 'action:src-pages-inbound-receptionnacional-jsx:lookupDescription',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1237',
      from: 'action:src-pages-inbound-receptionnacional-jsx:normSerie',
      to: 'action:src-pages-inbound-receptionnacional-jsx:insertRecepcionItemsNacionalesInChunks',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1238',
      from: 'screen:inventory-carteles',
      to: 'action:src-pages-inventory-carteles-jsx:Carteles',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1239',
      from: 'action:src-pages-inventory-carteles-jsx:Carteles',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1240',
      from: 'module:inventario',
      to: 'component:src-pages-mobile-consultapda-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1241',
      from: 'component:src-pages-mobile-consultapda-jsx',
      to: 'action:src-pages-mobile-consultapda-jsx:buscar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1242',
      from: 'action:src-pages-mobile-consultapda-jsx:buscar',
      to: 'resource:table:wms-ubicaciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1243',
      from: 'screen:mobile-pda',
      to: 'action:src-pages-mobile-warehousepda-jsx:processPutawayInput',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1244',
      from: 'action:src-pages-mobile-warehousepda-jsx:processPutawayInput',
      to: 'resource:table:wms-ubicaciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1245',
      from: 'action:src-pages-mobile-warehousepda-jsx:processPutawayInput',
      to: 'resource:table:tms-matriz-codigos',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1246',
      from: 'screen:mobile-pda',
      to: 'action:src-pages-mobile-warehousepda-jsx:encolar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1247',
      from: 'action:src-pages-mobile-warehousepda-jsx:encolar',
      to: 'resource:rpc:registrar-putaway-ubicaciones',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1248',
      from: 'module:panel',
      to: 'component:src-pages-panel-builder-builderservice-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1249',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:fetchDashboards',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1250',
      from: 'action:src-pages-panel-builder-builderservice-js:fetchDashboards',
      to: 'resource:table:tms-dashboard-layouts',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1251',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:saveDashboard',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1252',
      from: 'action:src-pages-panel-builder-builderservice-js:saveDashboard',
      to: 'resource:rpc:guardar-dashboard',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1253',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:deleteDashboard',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1254',
      from: 'action:src-pages-panel-builder-builderservice-js:deleteDashboard',
      to: 'resource:rpc:eliminar-dashboard',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1255',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1256',
      from: 'action:src-pages-panel-builder-builderservice-js:fetchCalculatedFields',
      to: 'resource:table:tms-builder-calculated-fields',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1257',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1258',
      from: 'action:src-pages-panel-builder-builderservice-js:saveCalculatedField',
      to: 'resource:rpc:guardar-campo-calculado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1259',
      from: 'component:src-pages-panel-builder-builderservice-js',
      to: 'action:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1260',
      from: 'action:src-pages-panel-builder-builderservice-js:deleteCalculatedField',
      to: 'resource:rpc:eliminar-campo-calculado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1261',
      from: 'module:panel',
      to: 'component:src-pages-panel-config-configservice-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1262',
      from: 'component:src-pages-panel-config-configservice-js',
      to: 'action:src-pages-panel-config-configservice-js:guardarCatalogo',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1263',
      from: 'action:src-pages-panel-config-configservice-js:guardarCatalogo',
      to: 'resource:rpc:guardar-panel-catalogo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1264',
      from: 'component:src-pages-panel-config-configservice-js',
      to: 'action:src-pages-panel-config-configservice-js:toggleCatalogo',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1265',
      from: 'action:src-pages-panel-config-configservice-js:toggleCatalogo',
      to: 'resource:rpc:toggle-panel-catalogo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1266',
      from: 'component:src-pages-panel-config-configservice-js',
      to: 'action:src-pages-panel-config-configservice-js:eliminarCatalogo',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1267',
      from: 'action:src-pages-panel-config-configservice-js:eliminarCatalogo',
      to: 'resource:rpc:eliminar-panel-catalogo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1268',
      from: 'component:src-pages-panel-config-configservice-js',
      to: 'action:src-pages-panel-config-configservice-js:fetchAuditoria',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1269',
      from: 'action:src-pages-panel-config-configservice-js:fetchAuditoria',
      to: 'resource:table:tms-operaciones-log',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1270',
      from: 'component:src-pages-panel-config-configservice-js',
      to: 'action:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1271',
      from: 'action:src-pages-panel-config-configservice-js:fetchAuditStatsPanel',
      to: 'resource:table:tms-operaciones-log',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1272',
      from: 'module:panel',
      to: 'component:src-pages-panel-dash-dashboardreal-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1273',
      from: 'component:src-pages-panel-dash-dashboardreal-jsx',
      to: 'action:src-pages-panel-dash-dashboardreal-jsx:refrescar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1274',
      from: 'module:panel',
      to: 'component:src-pages-panel-dash-dashdata-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1275',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchConsolidados',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1276',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchConsolidados',
      to: 'resource:table:tms-consolidados',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1277',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchConsolidados',
      to: 'resource:table:tms-consolidado-nvs',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1278',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:run',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1279',
      from: 'action:src-pages-panel-dash-dashdata-js:run',
      to: 'resource:table:tms-consolidado-nvs',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1280',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchDashboards',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1281',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchDashboards',
      to: 'resource:table:dashboard-layouts',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1282',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchTransportistas',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1283',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchTransportistas',
      to: 'resource:table:transportistas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1284',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchVendedores',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1285',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchVendedores',
      to: 'resource:table:vendedores',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1286',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchCalculatedFields',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1287',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchCalculatedFields',
      to: 'resource:table:builder-calculated-fields',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1288',
      from: 'component:src-pages-panel-dash-dashdata-js',
      to: 'action:src-pages-panel-dash-dashdata-js:fetchAuditByNv',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1289',
      from: 'action:src-pages-panel-dash-dashdata-js:fetchAuditByNv',
      to: 'resource:rpc:nv-bitacora',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1290',
      from: 'module:panel',
      to: 'component:src-pages-panel-info-certificadossalida-jsx',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1291',
      from: 'component:src-pages-panel-info-certificadossalida-jsx',
      to: 'action:src-pages-panel-info-certificadossalida-jsx:CertificadosSalida',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1292',
      from: 'action:src-pages-panel-info-certificadossalida-jsx:CertificadosSalida',
      to: 'resource:rpc:nv-certificados-salida',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1293',
      from: 'module:panel',
      to: 'component:src-pages-panel-ingresar-ingresarservice-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1294',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:run',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1295',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:run',
      to: 'resource:table:tms-panel-transportistas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1296',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:run',
      to: 'resource:table:tms-nv-catalogo',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1297',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:run',
      to: 'resource:table:tms-panel-vendedores',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1298',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:guardar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1299',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:guardar',
      to: 'resource:rpc:guardar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1300',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1301',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeEditarOperacion',
      to: 'resource:rpc:iam-puede-editar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1302',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1303',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:puedeCambiarEstadoOperacion',
      to: 'resource:rpc:iam-puede-cambiar-estado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1304',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1305',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:cambiarEstado',
      to: 'resource:rpc:cambiar-estado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1306',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1307',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:corregirEstadoAShipping',
      to: 'resource:rpc:corregir-estado-nv-a-shipping',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1308',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1309',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:gestionarPausaShipping',
      to: 'resource:rpc:gestionar-pausa-shipping-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1310',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1311',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:reportarIncidenciaArmado',
      to: 'resource:rpc:reportar-incidencia-armado-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1312',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1313',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:actualizarCampos',
      to: 'resource:rpc:guardar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1314',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1315',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:listarSolicitudesReapertura',
      to: 'resource:table:tms-nv-reaperturas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1316',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1317',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:solicitarReapertura',
      to: 'resource:rpc:solicitar-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1318',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1319',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:resolverReapertura',
      to: 'resource:rpc:resolver-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1320',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1321',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminar',
      to: 'resource:rpc:eliminar-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1322',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1323',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      to: 'resource:table:tms-consolidados',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1324',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:listarConsolidados',
      to: 'resource:table:tms-consolidado-nvs',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1325',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1326',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:guardarConsolidado',
      to: 'resource:rpc:guardar-consolidado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1327',
      from: 'component:src-pages-panel-ingresar-ingresarservice-js',
      to: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1328',
      from: 'action:src-pages-panel-ingresar-ingresarservice-js:eliminarConsolidado',
      to: 'resource:rpc:eliminar-consolidado',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1329',
      from: 'module:panel',
      to: 'component:src-pages-panel-panelqueries-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1330',
      from: 'component:src-pages-panel-panelqueries-js',
      to: 'action:src-pages-panel-panelqueries-js:centrosPermitidos',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1331',
      from: 'action:src-pages-panel-panelqueries-js:centrosPermitidos',
      to: 'resource:rpc:iam-mis-scopes',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1332',
      from: 'module:panel',
      to: 'component:src-pages-panel-reaperturas-reopenrequestsservice-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1333',
      from: 'component:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1334',
      from: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:fetchReopenInbox',
      to: 'resource:rpc:listar-bandeja-reaperturas-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1335',
      from: 'component:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1336',
      from: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:resolveReopenRequest',
      to: 'resource:rpc:resolver-reapertura-nv',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1337',
      from: 'component:src-pages-panel-reaperturas-reopenrequestsservice-js',
      to: 'action:src-pages-panel-reaperturas-reopenrequestsservice-js:subscribeToReopenRequests',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1338',
      from: 'module:panel',
      to: 'component:src-pages-panel-rutas-routecoordinationservice-js',
      relation: 'contiene',
      label: 'incluye componente'
    },
    {
      id: 'connection:1339',
      from: 'component:src-pages-panel-rutas-routecoordinationservice-js',
      to: 'action:src-pages-panel-rutas-routecoordinationservice-js:rpc',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1340',
      from: 'action:src-pages-panel-rutas-routecoordinationservice-js:rpc',
      to: 'edge:coord-route-distance',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:1341',
      from: 'screen:panel-tv',
      to: 'action:src-pages-panel-tv-paneltvreal-jsx:TVDashboard',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1342',
      from: 'screen:soporte',
      to: 'action:src-pages-postventa-solicitudpublica-jsx:enviar',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1343',
      from: 'action:src-pages-postventa-solicitudpublica-jsx:enviar',
      to: 'edge:postventa-publico',
      relation: 'invoca',
      label: 'invoca edge-function'
    },
    {
      id: 'connection:1344',
      from: 'screen:consulta',
      to: 'action:src-pages-public-consultanv-jsx:ConsultaNV',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1345',
      from: 'action:src-pages-public-consultanv-jsx:ConsultaNV',
      to: 'resource:rpc:buscar-nv-publico',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1346',
      from: 'screen:quality-clasificacion',
      to: 'action:src-pages-quality-clasificacionproductos-jsx:ClasificacionProductos',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1347',
      from: 'action:src-pages-quality-clasificacionproductos-jsx:ClasificacionProductos',
      to: 'resource:table:tms-producto-categoria',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1348',
      from: 'action:src-pages-quality-clasificacionproductos-jsx:ClasificacionProductos',
      to: 'resource:table:tms-categorias-calidad',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1349',
      from: 'screen:queries-addresses',
      to: 'action:src-pages-queries-addresses-jsx:descargarMatriz',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1350',
      from: 'action:src-pages-queries-addresses-jsx:descargarMatriz',
      to: 'resource:table:tms-direcciones',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1351',
      from: 'screen:queries-addresses',
      to: 'action:src-pages-queries-addresses-jsx:handleSearch',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1352',
      from: 'action:src-pages-queries-addresses-jsx:handleSearch',
      to: 'resource:rpc:buscar-direcciones',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1353',
      from: 'screen:queries-addresses',
      to: 'action:src-pages-queries-addresses-jsx:deleteRow',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1354',
      from: 'action:src-pages-queries-addresses-jsx:deleteRow',
      to: 'resource:table:tms-direcciones',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1355',
      from: 'screen:queries-addresses',
      to: 'action:src-pages-queries-addresses-jsx:saveEdit',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1356',
      from: 'action:src-pages-queries-addresses-jsx:saveEdit',
      to: 'resource:table:tms-direcciones',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1357',
      from: 'action:src-pages-queries-addresses-jsx:saveEdit',
      to: 'action:src-pages-queries-addresses-jsx:handleSearch',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1358',
      from: 'action:src-pages-queries-addresses-jsx:saveEdit',
      to: 'action:src-pages-queries-addresses-jsx:deleteRow',
      relation: 'invoca',
      label: 'invoca acción'
    },
    {
      id: 'connection:1359',
      from: 'screen:queries-batches',
      to: 'action:src-pages-queries-batches-jsx:Batches',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1360',
      from: 'action:src-pages-queries-batches-jsx:Batches',
      to: 'resource:rpc:search-batches',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1361',
      from: 'action:src-pages-queries-batches-jsx:Batches',
      to: 'resource:table:animate-header',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1362',
      from: 'action:src-pages-queries-batches-jsx:Batches',
      to: 'resource:table:animate-search',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1363',
      from: 'action:src-pages-queries-batches-jsx:Batches',
      to: 'resource:table:animate-decor',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1364',
      from: 'screen:queries-grupo',
      to: 'action:src-pages-queries-consultagrupo-jsx:ConsultaGrupo',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1365',
      from: 'action:src-pages-queries-consultagrupo-jsx:ConsultaGrupo',
      to: 'resource:rpc:consultar-grupo',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1366',
      from: 'screen:queries-dispatch-control',
      to: 'action:src-pages-queries-dispatchcontrol-jsx:DispatchControl',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1367',
      from: 'action:src-pages-queries-dispatchcontrol-jsx:DispatchControl',
      to: 'resource:table:tms-control-despacho',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1368',
      from: 'screen:queries-heatmap',
      to: 'action:src-pages-queries-heatmap-jsx:Heatmap',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1369',
      from: 'action:src-pages-queries-heatmap-jsx:Heatmap',
      to: 'resource:table:hm-fade',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1370',
      from: 'action:src-pages-queries-heatmap-jsx:Heatmap',
      to: 'resource:table:rack-section',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1371',
      from: 'screen:queries-historial-nv',
      to: 'action:src-pages-queries-historialnv-jsx:HistorialNV',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1372',
      from: 'action:src-pages-queries-historialnv-jsx:HistorialNV',
      to: 'resource:table:tms-nv-diarias',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1373',
      from: 'screen:queries-datasheet',
      to: 'action:src-pages-queries-productdatasheet-jsx:ProductDatasheet',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1374',
      from: 'action:src-pages-queries-productdatasheet-jsx:ProductDatasheet',
      to: 'resource:rpc:search-productos',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1375',
      from: 'action:src-pages-queries-productdatasheet-jsx:ProductDatasheet',
      to: 'resource:rpc:get-ficha-producto',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1376',
      from: 'screen:queries-datasheet',
      to: 'action:src-pages-queries-productdatasheet-jsx:handleFile',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1377',
      from: 'action:src-pages-queries-productdatasheet-jsx:handleFile',
      to: 'resource:table:tms-fichas-imagenes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1378',
      from: 'screen:queries-datasheet',
      to: 'action:src-pages-queries-productdatasheet-jsx:deleteFoto',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1379',
      from: 'action:src-pages-queries-productdatasheet-jsx:deleteFoto',
      to: 'resource:table:tms-fichas-imagenes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1380',
      from: 'screen:queries-datasheet',
      to: 'action:src-pages-queries-productdatasheet-jsx:setPrincipal',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1381',
      from: 'action:src-pages-queries-productdatasheet-jsx:setPrincipal',
      to: 'resource:table:tms-fichas-imagenes',
      relation: 'escribe',
      label: 'escribe table'
    },
    {
      id: 'connection:1382',
      from: 'screen:queries-sales-status',
      to: 'action:src-pages-queries-salesstatus-jsx:SalesStatus',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1383',
      from: 'action:src-pages-queries-salesstatus-jsx:SalesStatus',
      to: 'resource:rpc:fuzzy-search',
      relation: 'ejecuta',
      label: 'ejecuta rpc'
    },
    {
      id: 'connection:1384',
      from: 'action:src-pages-queries-salesstatus-jsx:SalesStatus',
      to: 'resource:table:tms-nv-diarias',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1385',
      from: 'action:src-pages-queries-salesstatus-jsx:SalesStatus',
      to: 'resource:table:tms-entregas',
      relation: 'lee',
      label: 'lee table'
    },
    {
      id: 'connection:1386',
      from: 'screen:queries-sales-status',
      to: 'action:src-pages-queries-salesstatus-jsx:debouncedInvalidateSearch',
      relation: 'ejecuta',
      label: 'ejecuta acción'
    },
    {
      id: 'connection:1387',
      from: 'edge:api-v1',
      to: 'resource:rpc:api-validar',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1388',
      from: 'edge:api-v1',
      to: 'resource:rpc:guardar-nv',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1389',
      from: 'edge:api-v1',
      to: 'resource:rpc:cambiar-estado-nv',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1390',
      from: 'edge:api-v1',
      to: 'resource:rpc:tms-orden-crear-desde-nv',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1391',
      from: 'edge:api-v1',
      to: 'resource:table:tms-api-log',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1392',
      from: 'edge:api-v1',
      to: 'resource:table:tms-operaciones',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1393',
      from: 'edge:api-v1',
      to: 'resource:table:tms-transporte-ordenes',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1394',
      from: 'edge:capgo-deploy',
      to: 'resource:rpc:puede-desplegar-ota',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1395',
      from: 'edge:capgo-deploy',
      to: 'resource:rpc:registrar-despliegue-ota',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1396',
      from: 'edge:coord-route-distance',
      to: 'resource:table:coord-rutas-distancias-cache',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1397',
      from: 'edge:notify-inventario',
      to: 'resource:table:tms-usuarios',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1398',
      from: 'edge:notify-ticket',
      to: 'resource:table:tms-usuarios',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1399',
      from: 'edge:notify-ticket-update',
      to: 'resource:table:tms-usuarios',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1400',
      from: 'edge:ota-deploy',
      to: 'resource:rpc:puede-desplegar-ota',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1401',
      from: 'edge:ota-deploy',
      to: 'resource:rpc:registrar-despliegue-ota',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1402',
      from: 'edge:ota-deploy',
      to: 'resource:table:mobile-ota-bundles',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1403',
      from: 'edge:ota-deploy',
      to: 'resource:table:mobile-ota-channels',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1404',
      from: 'edge:ota-deploy',
      to: 'resource:table:mobile-ota-devices',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1405',
      from: 'edge:ota-publish',
      to: 'resource:table:mobile-ota-bundles',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1406',
      from: 'edge:ota-publish',
      to: 'resource:table:mobile-ota-channels',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1407',
      from: 'edge:ota-updates',
      to: 'resource:table:mobile-ota-devices',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1408',
      from: 'edge:ota-updates',
      to: 'resource:table:mobile-ota-events',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1409',
      from: 'edge:ota-updates',
      to: 'resource:table:mobile-ota-channels',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1410',
      from: 'edge:ota-updates',
      to: 'resource:table:mobile-ota-bundles',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1411',
      from: 'edge:postventa-extractor',
      to: 'resource:rpc:ingesta-pv-correo',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1412',
      from: 'edge:postventa-extractor',
      to: 'resource:table:tms-postventa-correos',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1413',
      from: 'edge:postventa-inbox',
      to: 'resource:rpc:ingesta-pv-correo',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1414',
      from: 'edge:postventa-publico',
      to: 'resource:rpc:crear-pv-ticket-publico',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1415',
      from: 'edge:rendiciones-publicas',
      to: 'resource:rpc:crear-rendicion-publica',
      relation: 'ejecuta',
      label: 'accede rpc'
    },
    {
      id: 'connection:1416',
      from: 'edge:rendiciones-publicas',
      to: 'resource:storage:rendicion-evidencias',
      relation: 'accede',
      label: 'accede storage'
    },
    {
      id: 'connection:1417',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-public-links',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1418',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendiciones',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1419',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-fotos',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1420',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-public-log',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1421',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-centros-costo',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1422',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-colaboradores',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1423',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:tms-postventa-tecnicos',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1424',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-categorias',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1425',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-subcategorias',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1426',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-categoria-subcategoria',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1427',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-items',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1428',
      from: 'edge:rendiciones-publicas',
      to: 'resource:table:rendicion-evidencias',
      relation: 'accede',
      label: 'accede table'
    },
    {
      id: 'connection:1429',
      from: 'edge:send-push',
      to: 'resource:table:tms-usuarios',
      relation: 'accede',
      label: 'accede table'
    }
  ],
  k = { meta: Xi, modules: Zi, countsByModule: Ji, nodes: es, connections: is },
  be = {
    module: { label: 'Módulo', icon: oe, tone: 'bg-orange-50 text-orange-700 border-orange-200' },
    screen: { label: 'Pantalla', icon: Le, tone: 'bg-sky-50 text-sky-700 border-sky-200' },
    component: {
      label: 'Componente',
      icon: oi,
      tone: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    service: {
      label: 'Servicio',
      icon: Ne,
      tone: 'bg-violet-50 text-violet-700 border-violet-200'
    },
    function: {
      label: 'Función',
      icon: Ie,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    action: { label: 'Acción UI', icon: ni, tone: 'bg-teal-50 text-teal-700 border-teal-200' },
    table: { label: 'Tabla', icon: ai, tone: 'bg-slate-50 text-slate-700 border-slate-200' },
    rpc: { label: 'RPC', icon: le, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
    'edge-function': {
      label: 'Edge Function',
      icon: si,
      tone: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    storage: { label: 'Storage', icon: le, tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
  },
  ss = [
    'inbound',
    'inventario',
    'quality',
    'panel',
    'queries',
    'postventa',
    'tms',
    'asistente',
    'admin',
    'public'
  ],
  Ae = (o) =>
    String(o || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
function ce({ kind: o, compact: m = !1 }) {
  const g = be[o] || be.component,
    _ = g.icon;
  return e.jsxs('span', {
    className: `inline-flex shrink-0 items-center gap-1 rounded-full border font-black uppercase tracking-[0.08em] ${g.tone} ${m ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[9px]'}`,
    children: [e.jsx(_, { size: m ? 9 : 11 }), ' ', g.label]
  });
}
function Re({ node: o, relation: m, onSelect: g, direction: _ }) {
  return o
    ? e.jsxs('button', {
        type: 'button',
        onClick: () => g(o.id),
        className:
          'group w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md',
        children: [
          e.jsxs('div', {
            className: 'mb-1.5 flex items-center justify-between gap-2',
            children: [
              e.jsx(ce, { kind: o.kind, compact: !0 }),
              e.jsx('span', {
                className: 'text-[9px] font-bold uppercase tracking-wide text-slate-400',
                children: _ === 'in' ? 'entra' : m
              })
            ]
          }),
          e.jsx('p', {
            className: 'line-clamp-2 text-xs font-black text-slate-800',
            children: o.displayLabel || o.label
          }),
          o.source &&
            e.jsx('p', { className: 'mt-1 truncate text-[9px] text-slate-400', children: o.source })
        ]
      })
    : null;
}
function as({ node: o, counts: m, active: g, onClick: _ }) {
  const f = (m.function || 0) + (m.action || 0);
  return e.jsxs('button', {
    type: 'button',
    onClick: _,
    className: `relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${g ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-200'}`,
    children: [
      e.jsx('span', { className: 'absolute inset-x-0 top-0 h-1', style: { background: o.color } }),
      e.jsxs('div', {
        className: 'flex items-start justify-between gap-3',
        children: [
          e.jsx('div', {
            className: 'grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm',
            style: { background: o.color },
            children: e.jsx(oe, { size: 19 })
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-1.5',
            children: [
              o.status !== 'activo' &&
                e.jsx('span', {
                  className:
                    'rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase text-amber-700',
                  children: o.status
                }),
              e.jsx(ve, { size: 16, className: 'text-slate-300' })
            ]
          })
        ]
      }),
      e.jsx('h3', { className: 'mt-3 text-sm font-black text-slate-900', children: o.label }),
      e.jsx('p', {
        className: 'mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-500',
        children: o.description
      }),
      e.jsxs('div', {
        className: 'mt-3 grid grid-cols-3 gap-1.5',
        children: [
          e.jsxs('div', {
            className: 'rounded-lg bg-sky-50 px-2 py-1.5 text-center',
            children: [
              e.jsx('b', { className: 'block text-sm text-sky-700', children: m.screen || 0 }),
              e.jsx('span', {
                className: 'text-[8px] font-bold uppercase text-sky-600',
                children: 'pantallas'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'rounded-lg bg-emerald-50 px-2 py-1.5 text-center',
            children: [
              e.jsx('b', { className: 'block text-sm text-emerald-700', children: f }),
              e.jsx('span', {
                className: 'text-[8px] font-bold uppercase text-emerald-600',
                children: 'funciones'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'rounded-lg bg-violet-50 px-2 py-1.5 text-center',
            children: [
              e.jsx('b', {
                className: 'block text-sm text-violet-700',
                children: (m.table || 0) + (m.rpc || 0)
              }),
              e.jsx('span', {
                className: 'text-[8px] font-bold uppercase text-violet-600',
                children: 'datos'
              })
            ]
          })
        ]
      })
    ]
  });
}
function we({
  node: o,
  incoming: m,
  outgoing: g,
  nodeById: _,
  onSelect: f,
  onClose: G,
  onNavigate: h
}) {
  var q, F;
  if (!o) return null;
  const P = [...m, ...g];
  return e.jsxs('aside', {
    className:
      'min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-3 xl:max-h-[calc(100dvh-120px)] xl:overflow-y-auto',
    children: [
      e.jsxs('div', {
        className: 'border-b border-slate-100 p-4',
        children: [
          e.jsxs('div', {
            className: 'flex items-start justify-between gap-3',
            children: [
              e.jsx(ce, { kind: o.kind }),
              e.jsx('button', {
                type: 'button',
                onClick: G,
                className:
                  'grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100',
                'aria-label': 'Cerrar detalle',
                children: e.jsx(se, { size: 16 })
              })
            ]
          }),
          e.jsx('h2', {
            className: 'mt-3 break-words text-lg font-black text-slate-950',
            children: o.displayLabel || o.label
          }),
          o.signature &&
            e.jsx('code', {
              className:
                'mt-2 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-[10px] text-emerald-300',
              children: o.signature
            }),
          e.jsx('p', {
            className: 'mt-3 text-xs leading-5 text-slate-600',
            children: o.description
          })
        ]
      }),
      e.jsxs('div', {
        className: 'space-y-4 p-4',
        children: [
          o.route &&
            e.jsxs('div', {
              children: [
                e.jsx('p', {
                  className: 'text-[9px] font-black uppercase tracking-[0.15em] text-slate-400',
                  children: 'Ruta'
                }),
                e.jsxs('div', {
                  className: 'mt-1.5 flex items-center gap-2',
                  children: [
                    e.jsx('code', {
                      className:
                        'min-w-0 flex-1 truncate rounded-lg bg-slate-100 px-2.5 py-2 text-[10px] text-slate-700',
                      children: o.route
                    }),
                    e.jsx('button', {
                      type: 'button',
                      onClick: () => h(o.route),
                      className:
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white hover:bg-orange-500',
                      title: 'Abrir pantalla',
                      children: e.jsx(De, { size: 14 })
                    })
                  ]
                })
              ]
            }),
          ((q = o.permissions) == null ? void 0 : q.length) > 0 &&
            e.jsxs('div', {
              children: [
                e.jsxs('p', {
                  className:
                    'flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400',
                  children: [e.jsx(ti, { size: 11 }), ' Permisos']
                }),
                e.jsx('div', {
                  className: 'mt-2 flex flex-wrap gap-1.5',
                  children: o.permissions.map((d) =>
                    e.jsx(
                      'span',
                      {
                        className:
                          'rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700',
                        children: d
                      },
                      d
                    )
                  )
                })
              ]
            }),
          ((F = o.operations) == null ? void 0 : F.length) > 0 &&
            e.jsxs('div', {
              children: [
                e.jsx('p', {
                  className: 'text-[9px] font-black uppercase tracking-[0.15em] text-slate-400',
                  children: 'Operaciones'
                }),
                e.jsx('div', {
                  className: 'mt-2 flex flex-wrap gap-1.5',
                  children: o.operations.map((d) =>
                    e.jsx(
                      'span',
                      {
                        className:
                          'rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700',
                        children: d
                      },
                      d
                    )
                  )
                })
              ]
            }),
          (o.owner || o.source) &&
            e.jsxs('div', {
              className: 'grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3',
              children: [
                o.owner &&
                  e.jsxs('div', {
                    children: [
                      e.jsx('span', {
                        className: 'text-[9px] font-black uppercase text-slate-400',
                        children: 'Responsable'
                      }),
                      e.jsx('p', {
                        className: 'mt-0.5 text-[11px] font-bold text-slate-700',
                        children: o.owner
                      })
                    ]
                  }),
                o.source &&
                  e.jsxs('div', {
                    children: [
                      e.jsx('span', {
                        className: 'text-[9px] font-black uppercase text-slate-400',
                        children: 'Archivo fuente'
                      }),
                      e.jsx('p', {
                        className: 'mt-0.5 break-all font-mono text-[9px] text-slate-600',
                        children: o.source
                      })
                    ]
                  })
              ]
            }),
          e.jsxs('div', {
            children: [
              e.jsxs('div', {
                className: 'mb-2 flex items-center justify-between',
                children: [
                  e.jsxs('p', {
                    className:
                      'flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400',
                    children: [e.jsx(ue, { size: 11 }), ' Conexiones directas']
                  }),
                  e.jsx('span', {
                    className: 'text-[10px] font-black text-slate-500',
                    children: P.length
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'max-h-64 space-y-1.5 overflow-y-auto pr-1',
                children: [
                  P.length === 0 &&
                    e.jsx('p', {
                      className: 'rounded-lg bg-slate-50 p-3 text-[10px] text-slate-400',
                      children: 'Sin conexiones registradas.'
                    }),
                  m.map((d) => {
                    const p = _.get(d.from);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        onClick: () => f(d.from),
                        className:
                          'flex w-full items-center gap-2 rounded-lg border border-slate-100 p-2 text-left hover:border-orange-200 hover:bg-orange-50/40',
                        children: [
                          e.jsx(pe, { size: 12, className: 'shrink-0 text-orange-500' }),
                          e.jsx('span', {
                            className:
                              'min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700',
                            children:
                              (p == null ? void 0 : p.displayLabel) ||
                              (p == null ? void 0 : p.label)
                          }),
                          e.jsx('span', {
                            className: 'text-[8px] uppercase text-slate-400',
                            children: d.relation
                          })
                        ]
                      },
                      `in-${d.id}`
                    );
                  }),
                  g.map((d) => {
                    const p = _.get(d.to);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        onClick: () => f(d.to),
                        className:
                          'flex w-full items-center gap-2 rounded-lg border border-slate-100 p-2 text-left hover:border-orange-200 hover:bg-orange-50/40',
                        children: [
                          e.jsx(li, { size: 12, className: 'shrink-0 text-sky-500' }),
                          e.jsx('span', {
                            className:
                              'min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700',
                            children:
                              (p == null ? void 0 : p.displayLabel) ||
                              (p == null ? void 0 : p.label)
                          }),
                          e.jsx('span', {
                            className: 'text-[8px] uppercase text-slate-400',
                            children: d.relation
                          })
                        ]
                      },
                      `out-${d.id}`
                    );
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}
function ns({ onOpenFlow: o }) {
  const m = ze(),
    [g, _] = l.useState('overview'),
    [f, G] = l.useState('all'),
    [h, P] = l.useState('all'),
    [q, F] = l.useState(''),
    [d, p] = l.useState(null),
    b = l.useMemo(() => new Map(k.nodes.map((s) => [s.id, s])), []),
    ae = l.useMemo(() => {
      const s = new Map();
      for (const y of k.connections) {
        const j = s.get(y.to) || [];
        (j.push(y), s.set(y.to, j));
      }
      return s;
    }, []),
    U = l.useMemo(() => {
      const s = new Map();
      for (const y of k.connections) {
        const j = s.get(y.from) || [];
        (j.push(y), s.set(y.from, j));
      }
      return s;
    }, []),
    K = l.useMemo(() => ss.map((s) => b.get(`module:${s}`)).filter(Boolean), [b]),
    u = d ? b.get(d) : null,
    S = d ? ae.get(d) || [] : [],
    C = d ? U.get(d) || [] : [],
    I = Ae(q.trim()),
    T = l.useMemo(
      () =>
        k.nodes.filter((s) =>
          s.kind === 'module' || (f !== 'all' && s.module !== f) || (h !== 'all' && s.kind !== h)
            ? !1
            : I
              ? Ae(
                  [
                    s.label,
                    s.displayLabel,
                    s.description,
                    s.route,
                    s.source,
                    ...(s.permissions || [])
                  ].join(' ')
                ).includes(I)
              : !0
        ),
      [h, f, I]
    ),
    z = f === 'all' ? null : b.get(`module:${f}`),
    x = u || z || b.get('module:panel'),
    H = x ? ae.get(x.id) || [] : [],
    R = x ? U.get(x.id) || [] : [],
    A = (s) => {
      (G(s), p(`module:${s}`), _('connections'));
    },
    E = () => {
      const s = new Blob([JSON.stringify(k, null, 2)], { type: 'application/json' }),
        y = URL.createObjectURL(s),
        j = document.createElement('a');
      ((j.href = y),
        (j.download = `arquitectura-cco-${k.meta.fingerprint}.json`),
        j.click(),
        URL.revokeObjectURL(y));
    };
  return e.jsxs('div', {
    className:
      'anim-fade-up mx-[calc(50%-50vw)] min-h-[calc(100dvh-88px)] bg-slate-50/70 px-3 pb-8 sm:px-5 lg:px-7',
    children: [
      e.jsxs('section', {
        className: 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        children: [
          e.jsx('div', {
            className:
              'border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6',
            children: e.jsxs('div', {
              className: 'flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between',
              children: [
                e.jsxs('div', {
                  className: 'flex items-start gap-3',
                  children: [
                    e.jsx('div', {
                      className:
                        'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-950/30',
                      children: e.jsx(ei, { size: 22 })
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsxs('div', {
                          className: 'flex flex-wrap items-center gap-2',
                          children: [
                            e.jsx('h1', {
                              className: 'text-lg font-black sm:text-xl',
                              children: 'Arquitectura funcional CCO'
                            }),
                            e.jsx('span', {
                              className:
                                'rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300',
                              children: 'sincronizado con código'
                            })
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-1 max-w-3xl text-[11px] leading-4 text-slate-300',
                          children:
                            'Navega desde cada módulo hasta sus pantallas, funciones, RPC, tablas y automatizaciones.'
                        })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'flex flex-wrap items-center gap-2',
                  children: [
                    e.jsxs('button', {
                      type: 'button',
                      onClick: E,
                      className:
                        'inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/15',
                      children: [e.jsx(Ee, { size: 14 }), ' Exportar catálogo']
                    }),
                    e.jsxs('button', {
                      type: 'button',
                      onClick: o,
                      className:
                        'inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black hover:bg-orange-600',
                      children: [e.jsx(fe, { size: 14 }), ' Abrir flujo operativo']
                    })
                  ]
                })
              ]
            })
          }),
          e.jsx('div', {
            className:
              'grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0',
            children: [
              ['Módulos', k.meta.totals.module, oe, 'text-orange-600'],
              ['Pantallas', k.meta.totals.screen, Le, 'text-sky-600'],
              ['Funciones', k.meta.totals.function + k.meta.totals.action, Ie, 'text-emerald-600'],
              ['Servicios', k.meta.totals.service, Ne, 'text-violet-600'],
              ['Datos / RPC', k.meta.totals.table + k.meta.totals.rpc, le, 'text-amber-600'],
              ['Conexiones', k.connections.length, ue, 'text-rose-600']
            ].map(([s, y, j, B]) =>
              e.jsxs(
                'div',
                {
                  className: 'flex items-center gap-3 px-4 py-3',
                  children: [
                    e.jsx(j, { size: 17, className: B }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('b', {
                          className: 'block text-base leading-none text-slate-900',
                          children: y
                        }),
                        e.jsx('span', {
                          className: 'text-[9px] font-bold uppercase tracking-wide text-slate-400',
                          children: s
                        })
                      ]
                    })
                  ]
                },
                s
              )
            )
          })
        ]
      }),
      e.jsx('section', {
        className: 'mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
        children: e.jsxs('div', {
          className: 'flex flex-col gap-3 lg:flex-row lg:items-center',
          children: [
            e.jsx('div', {
              className: 'flex rounded-xl bg-slate-100 p-1',
              children: [
                ['overview', 'Vista general', oe],
                ['connections', 'Conexiones', ue],
                ['catalog', 'Catálogo técnico', ii]
              ].map(([s, y, j]) =>
                e.jsxs(
                  'button',
                  {
                    type: 'button',
                    onClick: () => _(s),
                    className: `inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition sm:flex-none ${g === s ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`,
                    children: [e.jsx(j, { size: 13 }), ' ', y]
                  },
                  s
                )
              )
            }),
            e.jsxs('div', {
              className: 'relative min-w-0 flex-1',
              children: [
                e.jsx(de, {
                  size: 15,
                  className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                }),
                e.jsx('input', {
                  value: q,
                  onChange: (s) => F(s.target.value),
                  onFocus: () => q && _('catalog'),
                  placeholder: 'Buscar módulo, pantalla, función, tabla, RPC, ruta o permiso…',
                  className:
                    'w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-xs outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                }),
                q &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: () => F(''),
                    className: 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400',
                    children: e.jsx(se, { size: 14 })
                  })
              ]
            }),
            e.jsxs('select', {
              value: f,
              onChange: (s) => {
                (G(s.target.value),
                  p(s.target.value === 'all' ? null : `module:${s.target.value}`));
              },
              className:
                'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-orange-400',
              children: [
                e.jsx('option', { value: 'all', children: 'Todos los módulos' }),
                K.map((s) => e.jsx('option', { value: s.module, children: s.label }, s.id))
              ]
            })
          ]
        })
      }),
      g === 'overview' &&
        e.jsxs('section', {
          className: 'mt-3',
          children: [
            e.jsxs('div', {
              className: 'mb-3 flex items-end justify-between gap-3',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('h2', {
                      className: 'text-sm font-black text-slate-900',
                      children: 'Construcción completa por dominio'
                    }),
                    e.jsx('p', {
                      className: 'mt-0.5 text-[10px] text-slate-500',
                      children:
                        'Selecciona un módulo para recorrer todas sus dependencias técnicas.'
                    })
                  ]
                }),
                e.jsxs('span', {
                  className:
                    'hidden text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:block',
                  children: ['Huella ', k.meta.fingerprint]
                })
              ]
            }),
            e.jsx('div', {
              className: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5',
              children: K.map((s) =>
                e.jsx(
                  as,
                  {
                    node: s,
                    counts: k.countsByModule[s.module] || {},
                    active: f === s.module,
                    onClick: () => A(s.module)
                  },
                  s.id
                )
              )
            })
          ]
        }),
      g === 'connections' &&
        x &&
        e.jsxs('section', {
          className: 'mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]',
          children: [
            e.jsxs('div', {
              className:
                'min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
              children: [
                e.jsx('div', {
                  className: 'border-b border-slate-100 px-4 py-3 sm:px-5',
                  children: e.jsxs('div', {
                    className: 'flex flex-wrap items-center justify-between gap-2',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'text-[9px] font-black uppercase tracking-[0.16em] text-orange-600',
                            children: 'Trazabilidad de conexión'
                          }),
                          e.jsx('h2', {
                            className: 'mt-1 text-base font-black text-slate-900',
                            children: x.displayLabel || x.label
                          })
                        ]
                      }),
                      e.jsxs('span', {
                        className:
                          'rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600',
                        children: [H.length, ' entradas · ', R.length, ' salidas']
                      })
                    ]
                  })
                }),
                e.jsx('div', {
                  className: 'overflow-x-auto bg-slate-50/70 p-4 sm:p-5',
                  children: e.jsxs('div', {
                    className:
                      'grid min-w-[720px] grid-cols-[1fr_46px_1.08fr_46px_1fr] items-start gap-2',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'mb-2 text-center text-[9px] font-black uppercase tracking-wider text-slate-400',
                            children: 'Quién lo usa / entrada'
                          }),
                          e.jsx('div', {
                            className: 'max-h-[520px] space-y-2 overflow-y-auto pr-1',
                            children:
                              H.length === 0
                                ? e.jsx('div', {
                                    className:
                                      'rounded-xl border border-dashed border-slate-300 p-5 text-center text-[10px] text-slate-400',
                                    children: 'Inicio del flujo'
                                  })
                                : H.map((s) =>
                                    e.jsx(
                                      Re,
                                      {
                                        node: b.get(s.from),
                                        relation: s.relation,
                                        direction: 'in',
                                        onSelect: p
                                      },
                                      s.id
                                    )
                                  )
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'grid min-h-28 place-items-center text-orange-400',
                        children: e.jsx(pe, { size: 22 })
                      }),
                      e.jsxs('button', {
                        type: 'button',
                        onClick: () => p(x.id),
                        className:
                          'relative mt-8 overflow-hidden rounded-2xl border-2 border-orange-400 bg-white p-5 text-center shadow-xl shadow-orange-100',
                        children: [
                          e.jsx('span', {
                            className: 'absolute inset-x-0 top-0 h-1 bg-orange-500'
                          }),
                          e.jsx(ce, { kind: x.kind }),
                          e.jsx('h3', {
                            className: 'mt-3 break-words text-sm font-black text-slate-950',
                            children: x.displayLabel || x.label
                          }),
                          e.jsx('p', {
                            className: 'mt-2 line-clamp-4 text-[10px] leading-4 text-slate-500',
                            children: x.description
                          }),
                          e.jsxs('span', {
                            className:
                              'mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase text-orange-600',
                            children: ['Ver ficha completa ', e.jsx(ve, { size: 11 })]
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'grid min-h-28 place-items-center text-sky-400',
                        children: e.jsx(pe, { size: 22 })
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'mb-2 text-center text-[9px] font-black uppercase tracking-wider text-slate-400',
                            children: 'Qué ejecuta / salida'
                          }),
                          e.jsx('div', {
                            className: 'max-h-[520px] space-y-2 overflow-y-auto pr-1',
                            children:
                              R.length === 0
                                ? e.jsx('div', {
                                    className:
                                      'rounded-xl border border-dashed border-slate-300 p-5 text-center text-[10px] text-slate-400',
                                    children: 'Fin del flujo'
                                  })
                                : R.map((s) =>
                                    e.jsx(
                                      Re,
                                      {
                                        node: b.get(s.to),
                                        relation: s.relation,
                                        direction: 'out',
                                        onSelect: p
                                      },
                                      s.id
                                    )
                                  )
                          })
                        ]
                      })
                    ]
                  })
                })
              ]
            }),
            e.jsx(we, {
              node: u || x,
              incoming: u ? S : H,
              outgoing: u ? C : R,
              nodeById: b,
              onSelect: p,
              onClose: () => p((z == null ? void 0 : z.id) || null),
              onNavigate: (s) => m(s)
            })
          ]
        }),
      g === 'catalog' &&
        e.jsxs('section', {
          className: 'mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]',
          children: [
            e.jsxs('div', {
              className:
                'min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
              children: [
                e.jsxs('div', {
                  className:
                    'flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h2', {
                          className: 'text-sm font-black text-slate-900',
                          children: 'Catálogo técnico verificable'
                        }),
                        e.jsxs('p', {
                          className: 'mt-0.5 text-[10px] text-slate-500',
                          children: [T.length, ' elementos coinciden con los filtros actuales.']
                        })
                      ]
                    }),
                    e.jsxs('select', {
                      value: h,
                      onChange: (s) => P(s.target.value),
                      className:
                        'rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-orange-400',
                      children: [
                        e.jsx('option', { value: 'all', children: 'Todos los tipos' }),
                        Object.entries(be)
                          .filter(([s]) => s !== 'module')
                          .map(([s, y]) => e.jsx('option', { value: s, children: y.label }, s))
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className:
                    'max-h-[calc(100dvh-310px)] min-h-[420px] divide-y divide-slate-100 overflow-y-auto',
                  children: [
                    T.slice(0, 300).map((s) =>
                      e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () => p(s.id),
                          className: `flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/50 ${d === s.id ? 'bg-orange-50' : ''}`,
                          children: [
                            e.jsx(ce, { kind: s.kind, compact: !0 }),
                            e.jsxs('div', {
                              className: 'min-w-0 flex-1',
                              children: [
                                e.jsx('p', {
                                  className: 'truncate text-xs font-black text-slate-800',
                                  children: s.displayLabel || s.label
                                }),
                                e.jsx('p', {
                                  className: 'mt-0.5 truncate text-[9px] text-slate-400',
                                  children: s.route || s.signature || s.source || s.description
                                })
                              ]
                            }),
                            e.jsx('span', {
                              className:
                                'hidden rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase text-slate-500 sm:block',
                              children: s.module
                            }),
                            e.jsx(ve, { size: 14, className: 'shrink-0 text-slate-300' })
                          ]
                        },
                        s.id
                      )
                    ),
                    T.length > 300 &&
                      e.jsx('div', {
                        className:
                          'bg-amber-50 p-3 text-center text-[10px] font-bold text-amber-700',
                        children:
                          'Se muestran los primeros 300 resultados. Usa la búsqueda o los filtros para acotar.'
                      }),
                    T.length === 0 &&
                      e.jsx('div', {
                        className: 'grid min-h-72 place-items-center p-6 text-center',
                        children: e.jsxs('div', {
                          children: [
                            e.jsx(de, { size: 28, className: 'mx-auto text-slate-300' }),
                            e.jsx('p', {
                              className: 'mt-3 text-sm font-black text-slate-600',
                              children: 'Sin coincidencias'
                            }),
                            e.jsx('p', {
                              className: 'mt-1 text-[10px] text-slate-400',
                              children: 'Prueba con otra función, tabla, RPC o permiso.'
                            })
                          ]
                        })
                      })
                  ]
                })
              ]
            }),
            u
              ? e.jsx(we, {
                  node: u,
                  incoming: S,
                  outgoing: C,
                  nodeById: b,
                  onSelect: p,
                  onClose: () => p(null),
                  onNavigate: (s) => m(s)
                })
              : e.jsx('aside', {
                  className:
                    'hidden rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center xl:grid xl:place-items-center',
                  children: e.jsxs('div', {
                    children: [
                      e.jsx(ci, { size: 26, className: 'mx-auto text-slate-300' }),
                      e.jsx('p', {
                        className: 'mt-3 text-sm font-black text-slate-600',
                        children: 'Selecciona un elemento'
                      }),
                      e.jsx('p', {
                        className: 'mt-1 text-[10px] leading-4 text-slate-400',
                        children:
                          'Verás su finalidad, archivo, permisos y todas sus conexiones directas.'
                      })
                    ]
                  })
                })
          ]
        }),
      e.jsxs('footer', {
        className:
          'mt-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] text-emerald-800 sm:flex-row sm:items-center sm:justify-between',
        children: [
          e.jsxs('span', {
            className: 'inline-flex items-center gap-1.5 font-bold',
            children: [
              e.jsx(ri, { size: 14 }),
              ' Catálogo generado automáticamente desde rutas, servicios y Supabase.'
            ]
          }),
          e.jsxs('span', {
            children: [
              'Esquema v',
              k.meta.schemaVersion,
              ' · Proyecto ',
              k.meta.sourceVersion,
              ' ·',
              ' ',
              k.meta.fingerprint
            ]
          })
        ]
      })
    ]
  });
}
const ie = {
    inicio: { pill: !0, dim: [128, 46] },
    fin: { pill: !0, dim: [128, 46] },
    tarea: { pill: !1, dim: [152, 54] },
    decision: { diamond: !0, dim: [164, 58] }
  },
  os = {
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
  cs = {
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
  qe = [
    { codigo: 'maestro', titulo: 'Flujo Maestro', seed: me },
    { codigo: 'master-data', titulo: 'Master Data', seed: Ei },
    { codigo: 'warehouse-wms', titulo: 'Warehouse (WMS)', seed: Di },
    { codigo: 'operaciones', titulo: 'Operaciones', seed: Bi },
    { codigo: 'tms', titulo: 'TMS', seed: Hi },
    { codigo: 'postventa', titulo: 'Postventa', seed: Wi }
  ],
  rs = [
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
  Te = (o) => (rs.find(([m]) => m.test(o || '')) || [])[1] || null,
  ts = {
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
function fs() {
  const [o, m] = l.useState('architecture');
  return o === 'architecture'
    ? e.jsx(ns, { onOpenFlow: () => m('operational') })
    : e.jsxs(e.Fragment, {
        children: [
          e.jsxs('div', {
            className:
              'mx-[calc(50%-50vw)] mb-3 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-6 lg:px-8',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('p', {
                    className: 'text-[9px] font-black uppercase tracking-[0.16em] text-orange-600',
                    children: 'Vista secundaria'
                  }),
                  e.jsx('p', {
                    className: 'text-xs font-bold text-slate-700',
                    children: 'Editor manual de flujos operativos'
                  })
                ]
              }),
              e.jsxs('button', {
                type: 'button',
                onClick: () => m('architecture'),
                className:
                  'inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-black text-white hover:bg-orange-500',
                children: [e.jsx(fe, { size: 14 }), ' Volver a Arquitectura CCO']
              })
            ]
          }),
          e.jsx(ls, {})
        ]
      });
}
function ls() {
  var Ce, Pe;
  const o = ze(),
    { hasPermission: m, user: g } = Si(),
    _ =
      m('manage_workflows') ||
      (g == null ? void 0 : g.rol) === 'ADMIN' ||
      (g == null ? void 0 : g.es_admin_delegado),
    [f, G] = l.useState('maestro'),
    [h, P] = l.useState({ nodes: [], edges: [] }),
    [q, F] = l.useState('Flujo Maestro CCO'),
    [d, p] = l.useState(!1),
    [b, ae] = l.useState(!1),
    [U, K] = l.useState(''),
    [u, S] = l.useState(null),
    [C, I] = l.useState(null),
    [T, z] = l.useState(null),
    [x, H] = l.useState(() => {
      try {
        return localStorage.getItem('fm_tema') || 'dark';
      } catch {
        return 'dark';
      }
    }),
    R = x === 'dark',
    A = os[x],
    E = cs[x];
  l.useEffect(() => {
    try {
      localStorage.setItem('fm_tema', x);
    } catch {}
  }, [x]);
  const s = l.useRef(null),
    y = l.useRef(null),
    [j, B] = l.useState({ s: 0.55, x: 0, y: 0 }),
    ge = l.useRef(1),
    L = l.useRef(null),
    $ = l.useRef(null),
    je = (i) => P((a) => ({ ...a, nodes: i(a.nodes) })),
    D = () => p(!0),
    re = (i) => {
      let a = 0;
      ([...(i.nodes || []), ...(i.edges || [])].forEach((n) => {
        const r = parseInt(String(n.id).replace(/\D/g, ''), 10) || 0;
        r > a && (a = r);
      }),
        (ge.current = a + 1));
    },
    xe = (i) => i + ge.current++,
    W = l.useMemo(() => Object.fromEntries(h.nodes.map((i) => [i.id, i])), [h.nodes]),
    Y = l.useCallback((i) => {
      const a = s.current;
      if (!a || !i.length) return;
      const n = Math.min(...i.map((N) => N.x)),
        r = Math.min(...i.map((N) => N.y)),
        t = Math.max(...i.map((N) => N.x + N.w)),
        v = Math.max(...i.map((N) => N.y + N.h)),
        c = t - n,
        O = v - r,
        M = a.clientWidth,
        J = a.clientHeight,
        ee = Math.min(M / c, J / O) * 0.9;
      B({ s: ee, x: -n * ee + (M - c * ee) / 2, y: -r * ee + (J - O * ee) / 2 });
    }, []),
    Me = () => Y(h.nodes),
    ne = l.useCallback(
      async (i) => {
        var t, v;
        const a = qe.find((c) => c.codigo === i);
        let n = null,
          r = null;
        try {
          const c = await Se(i);
          (t = c == null ? void 0 : c.modelo) != null &&
            t.nodes &&
            ((n = c.modelo), (r = c.titulo));
        } catch {}
        (n ||
          ((n = { nodes: a.seed.nodes, edges: a.seed.edges }),
          (r = ((v = a.seed._meta) == null ? void 0 : v.titulo) || a.titulo)),
          P({ nodes: n.nodes.map((c) => ({ ...c })), edges: n.edges.map((c) => ({ ...c })) }),
          F(r || a.titulo),
          re(n),
          p(!1),
          S(null),
          z(null),
          I(null),
          requestAnimationFrame(() => Y(n.nodes)));
      },
      [Y]
    );
  l.useEffect(() => {
    ne('maestro');
  }, [ne]);
  const Fe = (i) => {
      i !== f &&
        ((d &&
          !window.confirm('Tienes cambios sin guardar. ¿Cambiar de diagrama y descartarlos?')) ||
          (G(i), ne(i)));
    },
    Be = (i) => {
      i.preventDefault();
      const a = s.current.getBoundingClientRect(),
        n = i.clientX - a.left,
        r = i.clientY - a.top;
      B((t) => {
        const v = Math.min(2.5, Math.max(0.1, t.s * (i.deltaY < 0 ? 1.12 : 0.89))),
          c = v / t.s;
        return { s: v, x: n - (n - t.x) * c, y: r - (r - t.y) * c };
      });
    },
    Ve = (i) => {
      i.target.closest('[data-node]') ||
        i.target.closest('[data-elabel]') ||
        (S(null), z(null), ($.current = { x: i.clientX, y: i.clientY }));
    },
    Ge = (i) => {
      if (L.current) {
        const a = (i.clientX - L.current.px) / j.s,
          n = (i.clientY - L.current.py) / j.s;
        ((L.current.px = i.clientX),
          (L.current.py = i.clientY),
          (L.current.moved = !0),
          je((r) => r.map((t) => (t.id === L.current.id ? { ...t, x: t.x + a, y: t.y + n } : t))));
        return;
      }
      if ($.current) {
        const a = i.clientX - $.current.x,
          n = i.clientY - $.current.y;
        (($.current = { x: i.clientX, y: i.clientY }),
          B((r) => ({ ...r, x: r.x + a, y: r.y + n })));
      }
    },
    ye = () => {
      var i;
      ((i = L.current) != null && i.moved && D(), (L.current = null), ($.current = null));
    },
    Ue = (i, a) => {
      (i.stopPropagation(),
        C === null &&
          (S({ kind: 'node', id: a.id }),
          b && (L.current = { id: a.id, px: i.clientX, py: i.clientY, moved: !1 })));
    },
    He = (i, a) => {
      if ((i.stopPropagation(), C !== null)) {
        if (C === '') {
          I(a.id);
          return;
        }
        (C !== a.id &&
          (P((n) => ({ ...n, edges: [...n.edges, { id: xe('e'), from: C, to: a.id, label: '' }] })),
          D()),
          I(''));
        return;
      }
      b || z(a);
    },
    $e = (i, a) => {
      if ((i.stopPropagation(), !b)) return;
      const n = window.prompt('Etiqueta del nodo:', a.label);
      n != null && X(a.id, { label: n });
    },
    X = (i, a) => {
      (je((n) => n.map((r) => (r.id === i ? { ...r, ...a } : r))), D());
    },
    Qe = (i, a) => {
      (P((n) => ({ ...n, edges: n.edges.map((r) => (r.id === i ? { ...r, ...a } : r)) })), D());
    },
    Ke = (i) => {
      const a = s.current,
        n = (a.clientWidth / 2 - j.x) / j.s,
        r = (a.clientHeight / 2 - j.y) / j.s,
        t = ie[i].dim,
        v = {
          id: xe('n'),
          type: i,
          label: i === 'decision' ? '¿Decisión?' : 'Nuevo',
          x: Math.round(n - t[0] / 2),
          y: Math.round(r - t[1] / 2),
          w: t[0],
          h: t[1]
        };
      (P((c) => ({ ...c, nodes: [...c.nodes, v] })), S({ kind: 'node', id: v.id }), D());
    },
    Z = l.useCallback(() => {
      u &&
        (u.kind === 'node'
          ? P((i) => ({
              nodes: i.nodes.filter((a) => a.id !== u.id),
              edges: i.edges.filter((a) => a.from !== u.id && a.to !== u.id)
            }))
          : P((i) => ({ ...i, edges: i.edges.filter((a) => a.id !== u.id) })),
        S(null),
        D());
    }, [u]);
  l.useEffect(() => {
    const i = (a) => {
      b &&
        (a.key === 'Delete' || a.key === 'Backspace') &&
        u &&
        !/input|textarea|select/i.test(a.target.tagName) &&
        (a.preventDefault(), Z());
    };
    return (window.addEventListener('keydown', i), () => window.removeEventListener('keydown', i));
  }, [b, u, Z]);
  const We = async () => {
      const i = await Yi(f, q, h);
      i != null && i.ok
        ? (V.success('Diagrama guardado'), p(!1))
        : V.error((i == null ? void 0 : i.error) || 'No se pudo guardar');
    },
    Ye = () => {
      const i = new Blob(
          [
            JSON.stringify(
              { _meta: { titulo: q, codigo: f }, nodes: h.nodes, edges: h.edges },
              null,
              2
            )
          ],
          { type: 'application/json' }
        ),
        a = URL.createObjectURL(i),
        n = document.createElement('a');
      ((n.href = a), (n.download = `flujo-${f}.json`), n.click(), URL.revokeObjectURL(a));
    },
    Xe = (i) => {
      var r;
      const a = (r = i.target.files) == null ? void 0 : r[0];
      if (!a) return;
      const n = new FileReader();
      ((n.onload = () => {
        try {
          const t = JSON.parse(n.result);
          if (!Array.isArray(t.nodes) || !Array.isArray(t.edges)) throw 0;
          (P({ nodes: t.nodes.map((v) => ({ ...v })), edges: t.edges.map((v) => ({ ...v })) }),
            re(t),
            D(),
            requestAnimationFrame(() => Y(t.nodes)),
            V.success('Importado — recuerda Guardar'));
        } catch {
          V.error('JSON inválido (se espera {nodes, edges})');
        }
      }),
        n.readAsText(a),
        (i.target.value = ''));
    },
    Ze = async () => {
      var v;
      if (f === 'maestro') return;
      const i = ts[f];
      if (!i) {
        V.error('Este diagrama no tiene filtro de dominio');
        return;
      }
      if (
        d &&
        !window.confirm(
          'Se reemplazará el contenido actual con el recorte del maestro. ¿Continuar?'
        )
      )
        return;
      let a = null;
      try {
        const c = await Se('maestro');
        (v = c == null ? void 0 : c.modelo) != null && v.nodes && (a = c.modelo);
      } catch {}
      a || (a = { nodes: me.nodes, edges: me.edges });
      const n = a.nodes.filter((c) => i.test(c.label || ''));
      if (!n.length) {
        V.error('El maestro no tiene nodos de este dominio');
        return;
      }
      const r = new Set(n.map((c) => c.id)),
        t = a.edges.filter((c) => r.has(c.from) && r.has(c.to));
      (P({ nodes: n.map((c) => ({ ...c })), edges: t.map((c) => ({ ...c })) }),
        re({ nodes: n, edges: t }),
        D(),
        requestAnimationFrame(() => Y(n)),
        V.success(`Recortado: ${n.length} nodos · ${t.length} conexiones (revisa y Guarda)`));
    },
    ke = (i, a, n) => {
      const r = i.x + i.w / 2,
        t = i.y + i.h / 2,
        v = a - r,
        c = n - t;
      if (!v && !c) return { x: r, y: t };
      const O = i.w / 2,
        M = i.h / 2,
        J = Math.min(v ? O / Math.abs(v) : 1 / 0, c ? M / Math.abs(c) : 1 / 0);
      return { x: r + v * J, y: t + c * J };
    },
    he = U.trim().toLowerCase(),
    _e = T && Te(T.label),
    w = (u == null ? void 0 : u.kind) === 'node' ? W[u.id] : null,
    Q = (u == null ? void 0 : u.kind) === 'edge' ? h.edges.find((i) => i.id === u.id) : null,
    Je = [
      ['tarea', fi],
      ['decision', gi],
      ['inicio', ji],
      ['fin', xi]
    ];
  return e.jsxs('div', {
    className: 'anim-fade-up mx-[calc(50%-50vw)] px-3 sm:px-6 lg:px-8 pb-6',
    children: [
      e.jsxs('div', {
        className: 'flex items-start justify-between gap-3 flex-wrap mb-3',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-3',
            children: [
              e.jsx('div', {
                className:
                  'w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20',
                children: e.jsx(fe, { size: 22 })
              }),
              e.jsxs('div', {
                children: [
                  e.jsxs('h1', {
                    className: 'text-xl font-black text-slate-800 leading-tight',
                    children: [
                      'Mapa de Procesos',
                      ' ',
                      d &&
                        e.jsx('span', {
                          className: 'text-orange-500 text-sm align-middle',
                          children: '• sin guardar'
                        })
                    ]
                  }),
                  e.jsxs('p', {
                    className: 'text-[13px] text-slate-500',
                    children: [
                      h.nodes.length,
                      ' nodos · ',
                      h.edges.length,
                      ' conexiones ·',
                      ' ',
                      b ? 'edición' : 'vista'
                    ]
                  })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2 flex-wrap',
            children: [
              e.jsx('select', {
                value: f,
                onChange: (i) => Fe(i.target.value),
                className:
                  'py-2 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-orange-400',
                children: qe.map((i) =>
                  e.jsx('option', { value: i.codigo, children: i.titulo }, i.codigo)
                )
              }),
              e.jsxs('div', {
                className: 'relative',
                children: [
                  e.jsx(de, {
                    size: 15,
                    className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
                  }),
                  e.jsx('input', {
                    value: U,
                    onChange: (i) => K(i.target.value),
                    placeholder: 'Resaltar…',
                    className:
                      'pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 w-32'
                  }),
                  U &&
                    e.jsx('button', {
                      onClick: () => K(''),
                      className: 'absolute right-2 top-1/2 -translate-y-1/2 text-slate-400',
                      children: e.jsx(se, { size: 14 })
                    })
                ]
              }),
              e.jsxs('div', {
                className:
                  'flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1',
                children: [
                  e.jsx('button', {
                    onClick: () => B((i) => ({ ...i, s: Math.max(0.1, i.s * 0.89) })),
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: e.jsx(ui, { size: 16 })
                  }),
                  e.jsxs('span', {
                    className: 'text-[11px] font-mono text-slate-400 w-9 text-center',
                    children: [Math.round(j.s * 100), '%']
                  }),
                  e.jsx('button', {
                    onClick: () => B((i) => ({ ...i, s: Math.min(2.5, i.s * 1.12) })),
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: e.jsx(di, { size: 16 })
                  }),
                  e.jsx('button', {
                    onClick: Me,
                    title: 'Ajustar',
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: e.jsx(pi, { size: 15 })
                  })
                ]
              }),
              e.jsx('button', {
                onClick: () => H((i) => (i === 'dark' ? 'light' : 'dark')),
                title: R ? 'Cambiar a claro' : 'Cambiar a oscuro',
                className:
                  'w-9 h-9 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50',
                children: R ? e.jsx(vi, { size: 16 }) : e.jsx(mi, { size: 16 })
              }),
              _ &&
                e.jsxs('button', {
                  onClick: () => {
                    (ae((i) => !i), I(null), S(null), z(null));
                  },
                  className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${b ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`,
                  children: [e.jsx(bi, { size: 15 }), ' ', b ? 'Salir' : 'Editar']
                })
            ]
          })
        ]
      }),
      b &&
        e.jsxs('div', {
          className:
            'flex items-center gap-1.5 flex-wrap mb-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5',
          children: [
            e.jsx('span', {
              className: 'text-[10px] font-black text-slate-400 uppercase mr-1',
              children: 'Agregar'
            }),
            Je.map(([i, a]) =>
              e.jsxs(
                'button',
                {
                  onClick: () => Ke(i),
                  className:
                    'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100',
                  children: [e.jsx(a, { size: 13 }), ' ', i[0].toUpperCase() + i.slice(1)]
                },
                i
              )
            ),
            e.jsx('span', { className: 'w-px h-5 bg-slate-200 mx-1' }),
            e.jsxs('button', {
              onClick: () => {
                (I(C === null ? '' : null), S(null));
              },
              className: `inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold ${C !== null ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`,
              children: [e.jsx(yi, { size: 13 }), ' Conectar']
            }),
            e.jsxs('button', {
              onClick: Z,
              disabled: !u,
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-40',
              children: [e.jsx(te, { size: 13 }), ' Borrar']
            }),
            e.jsx('span', { className: 'w-px h-5 bg-slate-200 mx-1' }),
            e.jsxs('button', {
              onClick: Ye,
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [e.jsx(Ee, { size: 13 }), ' Exportar']
            }),
            e.jsxs('button', {
              onClick: () => {
                var i;
                return (i = y.current) == null ? void 0 : i.click();
              },
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [e.jsx(ki, { size: 13 }), ' Importar']
            }),
            e.jsx('input', {
              ref: y,
              type: 'file',
              accept: 'application/json,.json',
              onChange: Xe,
              className: 'hidden'
            }),
            f !== 'maestro' &&
              e.jsxs('button', {
                onClick: Ze,
                title: 'Extrae del Flujo Maestro los nodos de este dominio',
                className:
                  'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-orange-600 hover:bg-orange-50',
                children: [e.jsx(hi, { size: 13 }), ' Recortar del maestro']
              }),
            e.jsxs('button', {
              onClick: () => ne(f),
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [e.jsx(_i, { size: 13 }), ' Recargar']
            }),
            e.jsxs('button', {
              onClick: We,
              disabled: !d,
              className:
                'ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40',
              children: [e.jsx(Ci, { size: 14 }), ' Guardar']
            })
          ]
        }),
      e.jsxs('div', {
        ref: s,
        onWheel: Be,
        onPointerDown: Ve,
        onPointerMove: Ge,
        onPointerUp: ye,
        onPointerLeave: ye,
        className: `relative overflow-hidden rounded-2xl border [background-size:22px_22px] select-none ${E.border} ${R ? 'bg-[radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)]' : 'bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] bg-white'} ${C !== null ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`,
        style: {
          height: 'calc(100vh - 190px)',
          minHeight: 480,
          touchAction: 'none',
          backgroundColor: E.canvasBg
        },
        children: [
          e.jsxs('div', {
            className: 'absolute top-0 left-0',
            style: {
              transform: `translate(${j.x}px,${j.y}px) scale(${j.s})`,
              transformOrigin: '0 0'
            },
            children: [
              e.jsxs('svg', {
                className: 'absolute top-0 left-0',
                width: '1',
                height: '1',
                style: { overflow: 'visible' },
                children: [
                  e.jsx('defs', {
                    children: e.jsx('marker', {
                      id: 'fm-arrow',
                      markerWidth: '9',
                      markerHeight: '9',
                      refX: '7',
                      refY: '3',
                      orient: 'auto',
                      children: e.jsx('path', { d: 'M0,0 L7,3 L0,6 Z', fill: E.arrow })
                    })
                  }),
                  h.edges.map((i) => {
                    const a = W[i.from],
                      n = W[i.to];
                    if (!a || !n) return null;
                    const r = ke(a, n.x + n.w / 2, n.y + n.h / 2),
                      t = ke(n, a.x + a.w / 2, a.y + a.h / 2),
                      v = (r.x + t.x) / 2,
                      c = (r.y + t.y) / 2,
                      O = (u == null ? void 0 : u.kind) === 'edge' && u.id === i.id;
                    return e.jsxs(
                      'g',
                      {
                        children: [
                          e.jsx('path', {
                            d: `M ${r.x} ${r.y} L ${t.x} ${t.y}`,
                            stroke: O ? '#f97316' : E.edge,
                            strokeWidth: O ? 2.4 : 1.6,
                            fill: 'none',
                            markerEnd: 'url(#fm-arrow)'
                          }),
                          e.jsx('path', {
                            d: `M ${r.x} ${r.y} L ${t.x} ${t.y}`,
                            stroke: 'transparent',
                            strokeWidth: '14',
                            fill: 'none',
                            style: { cursor: b ? 'pointer' : 'default', pointerEvents: 'stroke' },
                            onPointerDown: (M) => {
                              (M.stopPropagation(), b && S({ kind: 'edge', id: i.id }));
                            }
                          }),
                          i.label &&
                            e.jsxs('g', {
                              'data-elabel': !0,
                              onPointerDown: (M) => {
                                (M.stopPropagation(), b && S({ kind: 'edge', id: i.id }));
                              },
                              style: { cursor: b ? 'pointer' : 'default' },
                              children: [
                                e.jsx('rect', {
                                  x: v - i.label.length * 3.2 - 4,
                                  y: c - 8,
                                  width: i.label.length * 6.4 + 8,
                                  height: 16,
                                  rx: 4,
                                  fill: E.labelBg,
                                  stroke: O ? '#f97316' : E.labelBorder
                                }),
                                e.jsx('text', {
                                  x: v,
                                  y: c + 3,
                                  textAnchor: 'middle',
                                  fontSize: '10',
                                  fontFamily: 'ui-monospace,monospace',
                                  fill: E.labelText,
                                  children: i.label
                                })
                              ]
                            })
                        ]
                      },
                      i.id
                    );
                  })
                ]
              }),
              h.nodes.map((i) => {
                const a = { ...(ie[i.type] || ie.tarea), ...(A[i.type] || A.tarea) },
                  n = he && i.label.toLowerCase().includes(he),
                  r = (u == null ? void 0 : u.kind) === 'node' && u.id === i.id,
                  t = C === i.id,
                  v = i.color || a.border;
                return e.jsxs(
                  'div',
                  {
                    'data-node': !0,
                    onPointerDown: (c) => Ue(c, i),
                    onClick: (c) => He(c, i),
                    onDoubleClick: (c) => $e(c, i),
                    className:
                      'absolute flex items-center justify-center text-center px-2 font-semibold leading-tight shadow-sm',
                    style: {
                      left: i.x,
                      top: i.y,
                      width: i.w,
                      height: i.h,
                      background: a.fill,
                      color: a.text,
                      border: `2px solid ${n || r || t ? '#f97316' : v}`,
                      borderRadius: a.pill ? 999 : 12,
                      fontSize: 12,
                      whiteSpace: 'pre-line',
                      cursor: b
                        ? C !== null
                          ? 'crosshair'
                          : 'grab'
                        : Te(i.label)
                          ? 'pointer'
                          : 'default',
                      boxShadow: n || r || t ? '0 0 0 4px rgba(249,115,22,.25)' : void 0
                    },
                    children: [
                      a.diamond &&
                        e.jsx('span', {
                          style: {
                            position: 'absolute',
                            top: -9,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 11,
                            color: v,
                            background: E.diamondBg,
                            padding: '0 3px',
                            borderRadius: 4
                          },
                          children: '◆'
                        }),
                      i.label
                    ]
                  },
                  i.id
                );
              })
            ]
          }),
          b &&
            (w || Q) &&
            e.jsxs('div', {
              className: `absolute top-3 right-3 w-60 border rounded-xl shadow-lg p-3 space-y-2.5 ${R ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('span', {
                      className:
                        'text-[10px] font-black text-slate-400 uppercase inline-flex items-center gap-1',
                      children: [e.jsx(Pi, { size: 12 }), ' Propiedades']
                    }),
                    e.jsx('button', {
                      onClick: () => S(null),
                      className: 'text-slate-400 hover:text-slate-200',
                      children: e.jsx(se, { size: 14 })
                    })
                  ]
                }),
                w &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('label', {
                        className: 'block',
                        children: [
                          e.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Etiqueta'
                          }),
                          e.jsx('textarea', {
                            rows: 2,
                            value: w.label,
                            onChange: (i) => X(w.id, { label: i.target.value }),
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400 resize-none'
                          })
                        ]
                      }),
                      e.jsxs('label', {
                        className: 'block',
                        children: [
                          e.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Tipo'
                          }),
                          e.jsxs('select', {
                            value: w.type,
                            onChange: (i) => {
                              const a = i.target.value;
                              X(w.id, { type: a, w: ie[a].dim[0], h: ie[a].dim[1], color: void 0 });
                            },
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400',
                            children: [
                              e.jsx('option', { value: 'tarea', children: 'Tarea' }),
                              e.jsx('option', { value: 'decision', children: 'Decisión' }),
                              e.jsx('option', { value: 'inicio', children: 'Inicio' }),
                              e.jsx('option', { value: 'fin', children: 'Fin' })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Color'
                          }),
                          e.jsx('input', {
                            type: 'color',
                            value: w.color || A[w.type].border,
                            onChange: (i) => X(w.id, { color: i.target.value }),
                            className: 'w-8 h-8 rounded border border-slate-200 p-0.5'
                          }),
                          w.color &&
                            e.jsx('button', {
                              onClick: () => X(w.id, { color: void 0 }),
                              className:
                                'text-[11px] font-bold text-slate-400 hover:text-slate-600',
                              children: 'reset'
                            }),
                          e.jsxs('button', {
                            onClick: Z,
                            className:
                              'ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600',
                            children: [e.jsx(te, { size: 12 }), ' Borrar']
                          })
                        ]
                      })
                    ]
                  }),
                Q &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('label', {
                        className: 'block',
                        children: [
                          e.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Etiqueta de la conexión'
                          }),
                          e.jsx('input', {
                            value: Q.label || '',
                            onChange: (i) => Qe(Q.id, { label: i.target.value }),
                            placeholder: '(sin etiqueta)',
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'text-[11px] text-slate-400',
                        children: [
                          (Ce = W[Q.from]) == null ? void 0 : Ce.label,
                          ' → ',
                          (Pe = W[Q.to]) == null ? void 0 : Pe.label
                        ]
                      }),
                      e.jsxs('button', {
                        onClick: Z,
                        className:
                          'inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600',
                        children: [e.jsx(te, { size: 12 }), ' Borrar conexión']
                      })
                    ]
                  })
              ]
            }),
          T &&
            !b &&
            e.jsxs('div', {
              className: `absolute bottom-3 right-3 w-64 border rounded-xl shadow-lg p-3 ${R ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-start justify-between gap-2',
                  children: [
                    e.jsx('span', {
                      className: 'text-[10px] font-black text-slate-400 uppercase',
                      children: T.type
                    }),
                    e.jsx('button', {
                      onClick: () => z(null),
                      className: 'text-slate-400 hover:text-slate-200',
                      children: e.jsx(se, { size: 14 })
                    })
                  ]
                }),
                e.jsx('p', {
                  className: `text-[14px] font-black mt-0.5 whitespace-pre-line ${R ? 'text-slate-100' : 'text-slate-800'}`,
                  children: T.label
                }),
                _e
                  ? e.jsxs('button', {
                      onClick: () => o(_e),
                      className:
                        'mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600',
                      children: [e.jsx(De, { size: 13 }), ' Ir al módulo']
                    })
                  : e.jsx('p', {
                      className: 'text-[11px] text-slate-400 mt-2',
                      children: 'Sin módulo asociado directo.'
                    })
              ]
            }),
          e.jsxs('div', {
            className: `absolute bottom-3 left-3 backdrop-blur border rounded-xl px-3 py-2 flex flex-wrap items-center gap-3 text-[10px] ${R ? 'bg-slate-900/80 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-500'}`,
            children: [
              e.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  e.jsx('span', {
                    className: 'w-3 h-3 rounded-full border-2',
                    style: { borderColor: A.inicio.border, background: A.inicio.fill }
                  }),
                  ' ',
                  'Inicio'
                ]
              }),
              e.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  e.jsx('span', {
                    className: 'w-3 h-3 rounded border-2',
                    style: { borderColor: A.tarea.border, background: A.tarea.fill }
                  }),
                  ' ',
                  'Tarea'
                ]
              }),
              e.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  e.jsx('span', {
                    className: 'w-3 h-3 rounded border-2',
                    style: { borderColor: A.decision.border, background: A.decision.fill }
                  }),
                  ' ',
                  'Decisión'
                ]
              }),
              e.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  e.jsx('span', {
                    className: 'w-3 h-3 rounded-full border-2',
                    style: { borderColor: A.fin.border, background: A.fin.fill }
                  }),
                  ' ',
                  'Fin'
                ]
              }),
              b
                ? e.jsx('span', {
                    className: 'italic',
                    children:
                      C !== null
                        ? C === ''
                          ? 'toca ORIGEN'
                          : 'toca DESTINO'
                        : 'arrastra · doble clic renombra · Supr borra'
                  })
                : e.jsx('span', { className: 'italic', children: 'clic en un nodo para ver / ir' })
            ]
          })
        ]
      })
    ]
  });
}
export { fs as default };
