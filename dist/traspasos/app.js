/* ============================================================
   Registro de Traspasos · Email
   - Persistencia local (localStorage)
   - Autocompletado de SKU desde data/catalog.js (window.CATALOG)
   - Estados: PENDIENTE / REVISAR / ENVIADO
   - Generación de correo (HTML + texto + mailto)
   ============================================================ */

/* Dos módulos: traspasos y ajustes de inventario, cada uno con su lista */
const STORAGE_KEYS = { traspasos: "traspasos_v1", ajustes: "ajustes_v1" };
let MODULE = localStorage.getItem("module") === "ajustes" ? "ajustes" : "traspasos";
const STATES = ["PENDIENTE", "REVISAR", "ENVIADO"];

/* Carpetas / Traslados: "" = Todas, "__none__" = Sin carpeta, o el nombre */
let activeFolder = "";
let sortBy = "createdAt_desc";
const foldersKey = () => "folders_" + MODULE;
function storedFolders() {
  try {
    return JSON.parse(localStorage.getItem(foldersKey())) || [];
  } catch {
    return [];
  }
}
function saveFolders(list) {
  localStorage.setItem(foldersKey(), JSON.stringify([...new Set(list)]));
}
function allFolders() {
  const set = new Set(storedFolders());
  items.forEach((it) => {
    if (it.folder) set.add(it.folder);
  });
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

/* Directrices frecuentes (Origen -> Destino). Puedes agregar más aquí. */
const DIRECTRICES = [
  { o: '21 "DISPONIBLE"', d: '21 "TRANSITORIO"' },
  { o: '21 "TRANSITORIO"', d: '21 "DISPONIBLE"' },
  { o: '21 "DISPONIBLE"', d: '22 "TRANSITORIO"' },
  { o: '22 "TRANSITORIO"', d: '21 "DISPONIBLE"' },
  { o: '21 "DISPONIBLE"', d: '24 "DISPONIBLE"' },
  { o: '24 "DISPONIBLE"', d: '21 "DISPONIBLE"' },
  { o: '21 "DISPONIBLE"', d: '5 "TRANSITORIO"' },
  { o: '5 "TRANSITORIO"', d: '21 "DISPONIBLE"' },
  { o: '21 "DISPONIBLE"', d: '3 "DISPONIBLE"' },
  { o: '3 "DISPONIBLE"', d: '21 "DISPONIBLE"' },
  { o: '21 "DISPONIBLE"', d: '99 "TRANSITORIO"' },
  { o: '21 "DISPONIBLE"', d: '7 "DISPONIBLE"' },
];

/* ---------- Estado en memoria ---------- */
let items = load();
let editingId = null;
let animateRows = true; // anima filas solo tras cambios de datos, no al filtrar

/* ---------- Catálogo de productos ----------
   Usa el catálogo actualizado (localStorage) si existe; si no, el que
   viene empaquetado en data/catalog.js (window.CATALOG). */
const CATALOG_KEY = "catalog_v1";
const DEFAULT_CATALOG = Array.isArray(window.CATALOG) ? window.CATALOG : [];

function loadCatalogStore() {
  try {
    const s = JSON.parse(localStorage.getItem(CATALOG_KEY));
    if (s && Array.isArray(s.items) && s.items.length) return s;
  } catch {}
  return null;
}
let catalogStore = loadCatalogStore();
let CATALOG = catalogStore ? catalogStore.items : DEFAULT_CATALOG;

let catalogIndex = new Map();
function rebuildCatalogIndex() {
  catalogIndex = new Map();
  for (const p of CATALOG) catalogIndex.set(String(p.c).toUpperCase(), p);
}
rebuildCatalogIndex();

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[MODULE])) || [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEYS[MODULE], JSON.stringify(items));
  if (typeof schedulePush === "function") schedulePush();
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- Fechas ---------- */
function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
/* Fecha de vencimiento "YYYY-MM-DD" -> "DD/MM/YYYY" */
function fmtVenc(v) {
  if (!v) return "";
  const p = v.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v;
}
/* Inicio (00:00) y fin (23:59) de un valor "YYYY-MM-DD" de input date */
function dayStart(v) {
  return v ? new Date(v + "T00:00:00").getTime() : null;
}
function dayEnd(v) {
  return v ? new Date(v + "T23:59:59.999").getTime() : null;
}

/* Cambia el estado de un registro y sella la fecha del cambio */
function setEstado(it, nuevo) {
  if (it.estado !== nuevo) {
    it.estado = nuevo;
    it.estadoAt = Date.now();
  }
}

/* Migración: asegura que los registros antiguos tengan fechas */
function migrate(arr) {
  let changed = false;
  arr.forEach((it) => {
    if (!it.createdAt) { it.createdAt = Date.now(); changed = true; }
    if (!it.estadoAt) { it.estadoAt = it.createdAt; changed = true; }
    if (!Array.isArray(it.lotes)) {
      it.lotes = [{ cantidad: it.cantidad ?? "", partida: it.partida ?? "", serie: it.serie ?? "" }];
      changed = true;
    }
  });
  return changed;
}
if (migrate(items)) save();

/* ============================================================
   Catálogo / autocompletado
   ============================================================ */
function fillSkuList(query) {
  const dl = $("#skuList");
  const q = query.trim().toUpperCase();
  if (q.length < 2) {
    dl.innerHTML = "";
    return;
  }
  const matches = [];
  for (const p of CATALOG) {
    const code = String(p.c).toUpperCase();
    if (code.includes(q) || String(p.d).toUpperCase().includes(q)) {
      matches.push(p);
      if (matches.length >= 25) break;
    }
  }
  dl.innerHTML = matches
    .map((p) => `<option value="${esc(p.c)}">${esc(p.d)}</option>`)
    .join("");
}

function applyCatalog(code) {
  const hit = catalogIndex.get(String(code).trim().toUpperCase());
  const hint = $("#skuHint");
  if (hit) {
    $("#descripcion").value = hit.d || "";
    $("#um").value = hit.u || "";
    hint.textContent = "✓ Encontrado en catálogo";
    hint.style.color = "var(--ok)";
  } else {
    hint.textContent = code ? "No está en el catálogo — escribe la descripción manualmente" : "";
    hint.style.color = "var(--muted)";
  }
}

/* ============================================================
   Directrices (Origen -> Destino)
   ============================================================ */
function fillDirectrizSelect() {
  const sel = $("#directriz");
  const opts = ['<option value="">— Selecciona una directriz —</option>'];
  DIRECTRICES.forEach((dir, i) => {
    opts.push(`<option value="${i}">${esc(dir.o)}  →  ${esc(dir.d)}</option>`);
  });
  opts.push('<option value="custom">✎ Personalizado</option>');
  sel.innerHTML = opts.join("");
}
fillDirectrizSelect();

$("#directriz").addEventListener("change", (e) => {
  const v = e.target.value;
  if (v === "" || v === "custom") return;
  const dir = DIRECTRICES[+v];
  if (dir) {
    $("#origen").value = dir.o;
    $("#destino").value = dir.d;
  }
});

/* Si editan a mano origen/destino, marca el selector como personalizado */
function syncDirectrizSelect() {
  const o = $("#origen").value.trim();
  const d = $("#destino").value.trim();
  const idx = DIRECTRICES.findIndex((x) => x.o === o && x.d === d);
  $("#directriz").value = idx >= 0 ? String(idx) : o || d ? "custom" : "";
}
$("#origen").addEventListener("input", syncDirectrizSelect);
$("#destino").addEventListener("input", syncDirectrizSelect);

/* ============================================================
   Ajuste a otro SKU (destino, con partida/vencimiento/serie)
   ============================================================ */
$("#destToggle").addEventListener("change", (e) => {
  $("#destBlock").hidden = !e.target.checked;
});
$("#destSku").addEventListener("input", (e) => fillSkuList(e.target.value));
function applyDestCatalog(code) {
  const hit = catalogIndex.get(String(code).trim().toUpperCase());
  const hint = $("#destHint");
  if (hit) {
    $("#destDesc").value = hit.d || "";
    hint.textContent = "✓ Encontrado en catálogo";
    hint.style.color = "var(--ok)";
  } else {
    hint.textContent = code ? "No está en el catálogo — escribe la descripción" : "";
    hint.style.color = "var(--muted)";
  }
}
$("#destSku").addEventListener("change", (e) => applyDestCatalog(e.target.value));
$("#destSku").addEventListener("blur", (e) => applyDestCatalog(e.target.value));

/* ============================================================
   Carpeta del formulario
   ============================================================ */
function fillFolderSelect(selected) {
  const sel = $("#folder");
  const opts = ['<option value="">— Sin carpeta —</option>'];
  allFolders().forEach((f) => opts.push(`<option value="${esc(f)}">${esc(f)}</option>`));
  sel.innerHTML = opts.join("");
  sel.value = selected || (activeFolder && activeFolder !== "__none__" ? activeFolder : "");
}
$("#newFolder").addEventListener("click", () => {
  const name = (prompt("Nombre de la nueva carpeta / traslado:") || "").trim();
  if (!name) return;
  const list = storedFolders();
  list.push(name);
  saveFolders(list);
  fillFolderSelect(name);
  activeFolder = name;
  render();
});

/* ============================================================
   Partidas / Cantidades (varias por registro)
   ============================================================ */
function loteRowEl(d) {
  d = d || {};
  const div = document.createElement("div");
  div.className = "lote-row";
  div.innerHTML =
    `<input class="lote-cant" type="number" min="0" step="any" placeholder="Cant. *" value="${esc(d.cantidad ?? "")}">` +
    `<input class="lote-part" placeholder="Partida" value="${esc(d.partida ?? "")}">` +
    `<input class="lote-serie" placeholder="Serie" value="${esc(d.serie ?? "")}">` +
    `<button type="button" class="lote-del" title="Quitar partida" aria-label="Quitar partida">✕</button>`;
  return div;
}
function addLote(d) {
  $("#lotes").appendChild(loteRowEl(d));
}
function setLotes(lotes) {
  $("#lotes").innerHTML = "";
  if (lotes && lotes.length) lotes.forEach(addLote);
  else addLote();
}
function readLotes() {
  const out = [];
  document.querySelectorAll("#lotes .lote-row").forEach((r) => {
    const cantidad = r.querySelector(".lote-cant").value.trim();
    const partida = r.querySelector(".lote-part").value.trim();
    const serie = r.querySelector(".lote-serie").value.trim();
    if (cantidad !== "" || partida || serie) out.push({ cantidad, partida, serie });
  });
  return out;
}
/* Normaliza un registro a su lista de partidas (compatibilidad) */
function lotesOf(it) {
  return it.lotes && it.lotes.length
    ? it.lotes
    : [{ cantidad: it.cantidad ?? "", partida: it.partida ?? "", serie: it.serie ?? "" }];
}
$("#addLote").addEventListener("click", () => addLote());
$("#lotes").addEventListener("click", (e) => {
  if (!e.target.classList.contains("lote-del")) return;
  const rows = document.querySelectorAll("#lotes .lote-row");
  if (rows.length > 1) e.target.closest(".lote-row").remove();
  else e.target.closest(".lote-row").querySelectorAll("input").forEach((i) => (i.value = ""));
});

/* ============================================================
   Formulario (alta y edición)
   ============================================================ */
$("#sku").addEventListener("input", (e) => fillSkuList(e.target.value));
$("#sku").addEventListener("change", (e) => applyCatalog(e.target.value));
$("#sku").addEventListener("blur", (e) => applyCatalog(e.target.value));

$("#itemForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const lotes = readLotes();
  const rec = {
    sku: $("#sku").value.trim(),
    descripcion: $("#descripcion").value.trim(),
    um: $("#um").value.trim(),
    lotes,
    folder: $("#folder").value,
    estado: $("#estado").value,
    asunto: $("#asunto").value.trim(),
  };
  if (MODULE === "traspasos") {
    rec.origen = $("#origen").value.trim();
    rec.destino = $("#destino").value.trim();
  } else {
    rec.accion = $("#accion").value;
    rec.obs = $("#obs").value.trim();
    if ($("#destToggle").checked && $("#destSku").value.trim()) {
      rec.destSku = $("#destSku").value.trim();
      rec.destDesc = $("#destDesc").value.trim();
      rec.destPartida = $("#destPartida").value.trim();
      rec.destSerie = $("#destSerie").value.trim();
      rec.destVenc = $("#destVenc").value; // YYYY-MM-DD
    }
  }
  if (!rec.sku || !rec.descripcion || !rec.um) {
    toast("Completa los campos obligatorios");
    return;
  }
  if (!lotes.length || lotes.some((l) => l.cantidad === "")) {
    toast("Cada partida necesita su cantidad");
    return;
  }

  if (editingId) {
    const it = items.find((x) => x.id === editingId);
    const nuevoEstado = rec.estado;
    delete rec.estado; // el estado se aplica con setEstado para sellar la fecha
    Object.assign(it, rec);
    setEstado(it, nuevoEstado);
    toast("Registro actualizado");
    exitEdit();
  } else {
    const now = Date.now();
    items.unshift({ id: uid(), createdAt: now, estadoAt: now, ...rec });
    toast("Registro agregado");
  }
  save();
  resetForm();
  animateRows = true;
  render();
});

function resetForm() {
  $("#itemForm").reset();
  $("#skuHint").textContent = "";
  $("#destHint").textContent = "";
  $("#estado").value = "PENDIENTE";
  $("#accion").value = "SUMAR";
  $("#destToggle").checked = false;
  $("#destBlock").hidden = true;
  setLotes(null); // una fila vacía
  fillFolderSelect();
}

function startEdit(id) {
  const it = items.find((x) => x.id === id);
  if (!it) return;
  editingId = id;
  fillFolderSelect(it.folder || "");
  $("#sku").value = it.sku;
  $("#descripcion").value = it.descripcion;
  $("#um").value = it.um;
  setLotes(lotesOf(it));
  if (MODULE === "traspasos") {
    $("#origen").value = it.origen || "";
    $("#destino").value = it.destino || "";
    syncDirectrizSelect();
  } else {
    $("#accion").value = it.accion || "SUMAR";
    $("#obs").value = it.obs || "";
    const hasDest = !!it.destSku;
    $("#destToggle").checked = hasDest;
    $("#destBlock").hidden = !hasDest;
    $("#destSku").value = it.destSku || "";
    $("#destDesc").value = it.destDesc || "";
    $("#destPartida").value = it.destPartida || "";
    $("#destSerie").value = it.destSerie || "";
    $("#destVenc").value = it.destVenc || "";
  }
  $("#estado").value = it.estado;
  $("#asunto").value = it.asunto || "";
  $("#submitBtn").textContent = "Guardar cambios";
  $("#cancelEdit").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitEdit() {
  editingId = null;
  $("#submitBtn").textContent = "Agregar registro";
  $("#cancelEdit").hidden = true;
}

$("#cancelEdit").addEventListener("click", () => {
  exitEdit();
  resetForm();
});
$("#itemForm").addEventListener("reset", () => {
  $("#skuHint").textContent = "";
});

/* ============================================================
   Render de la tabla
   ============================================================ */
function visibleItems() {
  const q = $("#search").value.trim().toLowerCase();
  const fEstado = $("#filterEstado").value;
  const dateField = $("#filterDateField").value; // createdAt | estadoAt
  const from = dayStart($("#filterFrom").value);
  const to = dayEnd($("#filterTo").value);

  const list = items.filter((it) => {
    if (activeFolder === "__none__" && it.folder) return false;
    if (activeFolder && activeFolder !== "__none__" && it.folder !== activeFolder) return false;
    if (fEstado && it.estado !== fEstado) return false;
    if (q) {
      const hay = [
        it.sku, it.descripcion, it.origen, it.destino, it.accion, it.obs,
        it.destSku, it.destDesc, it.destPartida, it.destSerie, it.folder,
        ...lotesOf(it).flatMap((l) => [l.partida, l.serie]),
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const ts = it[dateField] || it.createdAt;
    if (from && ts < from) return false;
    if (to && ts > to) return false;
    return true;
  });

  const order = { PENDIENTE: 0, REVISAR: 1, ENVIADO: 2 };
  const by = {
    createdAt_desc: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    createdAt_asc: (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    sku_asc: (a, b) => String(a.sku).localeCompare(String(b.sku), "es"),
    estado: (a, b) => order[a.estado] - order[b.estado] || (b.createdAt || 0) - (a.createdAt || 0),
    folder: (a, b) =>
      String(a.folder || "").localeCompare(String(b.folder || ""), "es") ||
      (b.createdAt || 0) - (a.createdAt || 0),
  };
  return list.sort(by[sortBy] || by.createdAt_desc);
}

/* ============================================================
   Carpetas: barra, resumen y acciones
   ============================================================ */
function folderItems(name) {
  return items.filter((it) => (name === "__none__" ? !it.folder : it.folder === name));
}
function sumUnidades(list) {
  let t = 0;
  list.forEach((it) =>
    lotesOf(it).forEach((l) => {
      const n = parseFloat(l.cantidad);
      if (!isNaN(n)) t += n;
    })
  );
  return +t.toFixed(2);
}
function renderFolderBar() {
  const bar = $("#folderbar");
  if (!bar) return;
  const noneCount = items.filter((it) => !it.folder).length;
  const chip = (val, label, count, active) =>
    `<button class="fchip${active ? " active" : ""}" data-f="${esc(val)}">${label} <b>${count}</b></button>`;
  let html = chip("", "Todas", items.length, activeFolder === "");
  if (noneCount || activeFolder === "__none__")
    html += chip("__none__", "Sin carpeta", noneCount, activeFolder === "__none__");
  allFolders().forEach((f) => (html += chip(f, "📁 " + esc(f), folderItems(f).length, activeFolder === f)));
  html += `<button class="fchip new" data-new="1">➕ Carpeta</button>`;
  bar.innerHTML = html;
}
function renderFolderInfo() {
  const info = $("#folderInfo");
  if (!info) return;
  if (activeFolder === "") {
    info.hidden = true;
    info.innerHTML = "";
    return;
  }
  const fitems = folderItems(activeFolder);
  const label = activeFolder === "__none__" ? "Sin carpeta" : activeFolder;
  const p = fitems.filter((x) => x.estado === "PENDIENTE").length;
  const r = fitems.filter((x) => x.estado === "REVISAR").length;
  const e = fitems.filter((x) => x.estado === "ENVIADO").length;
  info.hidden = false;
  info.innerHTML =
    `<div class="fi-head"><span class="fi-title">📁 ${esc(label)}</span>` +
    `<span class="fi-stats">${fitems.length} SKU · ${sumUnidades(fitems)} uds · ` +
    `<span class="dot warn"></span>${p} <span class="dot blue"></span>${r} <span class="dot ok"></span>${e}</span></div>` +
    `<div class="fi-actions">` +
    `<button class="btn primary" id="btnFolderMail" ${fitems.length ? "" : "disabled"}>✉ Correo de la carpeta</button>` +
    (activeFolder !== "__none__"
      ? `<button class="btn ghost" id="btnFolderRename">✏️ Renombrar</button>` +
        `<button class="btn danger" id="btnFolderDelete">🗑 Eliminar carpeta</button>`
      : "") +
    `</div>`;
}
function renameFolder(name) {
  if (name === "__none__") return;
  const nuevo = (prompt("Nuevo nombre de la carpeta:", name) || "").trim();
  if (!nuevo || nuevo === name) return;
  items.forEach((it) => {
    if (it.folder === name) it.folder = nuevo;
  });
  saveFolders(storedFolders().map((f) => (f === name ? nuevo : f)));
  activeFolder = nuevo;
  save();
  fillFolderSelect(nuevo);
  render();
}
function deleteFolder(name) {
  if (name === "__none__") return;
  if (!confirm(`Los registros de "${name}" pasarán a "Sin carpeta". ¿Eliminar la carpeta?`)) return;
  items.forEach((it) => {
    if (it.folder === name) it.folder = "";
  });
  saveFolders(storedFolders().filter((f) => f !== name));
  activeFolder = "";
  save();
  fillFolderSelect("");
  render();
}
$("#folderbar").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.new) {
    $("#newFolder").click();
    return;
  }
  activeFolder = b.dataset.f;
  fillFolderSelect(activeFolder && activeFolder !== "__none__" ? activeFolder : "");
  render();
});
$("#folderInfo").addEventListener("click", (e) => {
  const id = e.target.id;
  if (id === "btnFolderMail") {
    const ids = folderItems(activeFolder).map((x) => x.id);
    if (ids.length) openMail(ids);
  } else if (id === "btnFolderRename") renameFolder(activeFolder);
  else if (id === "btnFolderDelete") deleteFolder(activeFolder);
});
$("#sortBy").addEventListener("change", (e) => {
  sortBy = e.target.value;
  render();
});

function render() {
  const list = visibleItems();
  const tbody = $("#tbody");
  $("#count").textContent = items.length;
  renderFolderBar();
  renderFolderInfo();

  /* Estadísticas por estado (sobre el total) */
  $("#stPend").textContent = items.filter((x) => x.estado === "PENDIENTE").length;
  $("#stRev").textContent = items.filter((x) => x.estado === "REVISAR").length;
  $("#stEnv").textContent = items.filter((x) => x.estado === "ENVIADO").length;

  /* Mensajes de vacío */
  $("#empty").hidden = items.length !== 0;
  $("#noMatch").hidden = !(items.length > 0 && list.length === 0);
  $("#shown").textContent =
    list.length === items.length ? "" : `Mostrando ${list.length} de ${items.length}`;

  const doAnim = animateRows;
  animateRows = false;
  tbody.className = doAnim ? "" : "no-anim";

  const isTras = MODULE === "traspasos";
  const col8Label = isTras ? "Directriz" : "Ajuste";

  tbody.innerHTML = list
    .map((it, i) => {
      const next = STATES[(STATES.indexOf(it.estado) + 1) % STATES.length];
      const col8 = isTras
        ? (it.origen || it.destino ? esc(it.origen || "—") + " → " + esc(it.destino || "—") : "—")
        : `<span class="adj ${it.accion || "SUMAR"}">${esc(it.accion || "SUMAR")}</span>`;
      const obsLine = !isTras && it.obs
        ? `<small class="obs-line">${esc(it.obs)}</small>` : "";
      let destLine = "";
      if (!isTras && it.destSku) {
        const bits = [];
        if (it.destPartida) bits.push("Partida: " + it.destPartida);
        if (it.destVenc) bits.push("Vence: " + fmtVenc(it.destVenc));
        if (it.destSerie) bits.push("Serie: " + it.destSerie);
        const extra = bits.length ? " · " + bits.join(" · ") : "";
        destLine = `<small class="obs-line dest">→ ${esc(it.destSku)} ${esc(it.destDesc || "")}${esc(extra)}</small>`;
      }
      const ls = lotesOf(it);
      const stack = (arr) => arr.map((v) => esc(v || "—")).join("<br>");
      const cantCell = stack(ls.map((l) => l.cantidad));
      const partCell = stack(ls.map((l) => l.partida));
      const serieCell = stack(ls.map((l) => l.serie));
      return `
      <tr data-id="${it.id}" style="--i:${Math.min(i, 24)}">
        <td class="col-chk"><input type="checkbox" class="row-check"></td>
        <td data-label="Código"><b class="code">${esc(it.sku)}</b>${!activeFolder && it.folder ? `<small class="folder-tag">📁 ${esc(it.folder)}</small>` : ""}</td>
        <td data-label="Descripción"><span class="desc">${esc(it.descripcion)}</span>${obsLine}${destLine}</td>
        <td data-label="U.M">${esc(it.um)}</td>
        <td data-label="Cantidad">${cantCell}</td>
        <td data-label="Partida">${partCell}</td>
        <td data-label="Serie">${serieCell}</td>
        <td data-label="${col8Label}">${col8}</td>
        <td data-label="Estado"><span class="pill ${it.estado}" title="Clic para cambiar a ${next}">${it.estado}</span></td>
        <td class="date-cell" data-label="F. Registro">${fmtDate(it.createdAt)}</td>
        <td class="date-cell" data-label="F. Estado">${fmtDate(it.estadoAt)}</td>
        <td class="col-act">
          <button class="rowbtn act-edit" title="Editar">✏️</button>
          <button class="rowbtn act-del" title="Eliminar">🗑</button>
        </td>
      </tr>`;
    })
    .join("");

  /* Resalta el chip de estadística activo según el filtro de estado */
  const active = $("#filterEstado").value;
  document.querySelectorAll(".stat").forEach((s) => {
    s.classList.toggle("active", s.dataset.stat === active);
  });

  updateBulk();
}

/* Delegación de eventos en la tabla */
$("#tbody").addEventListener("click", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains("pill")) {
    const it = items.find((x) => x.id === id);
    setEstado(it, STATES[(STATES.indexOf(it.estado) + 1) % STATES.length]);
    save();
    animateRows = true;
    render();
    return;
  }
  if (e.target.classList.contains("act-edit")) return startEdit(id);
  if (e.target.classList.contains("act-del")) {
    if (confirm("¿Eliminar este registro?")) {
      items = items.filter((x) => x.id !== id);
      save();
      animateRows = true;
      render();
    }
  }
});

$("#tbody").addEventListener("change", (e) => {
  if (e.target.classList.contains("row-check")) updateBulk();
});

/* ============================================================
   Selección múltiple / acciones masivas
   ============================================================ */
function selectedIds() {
  return [...document.querySelectorAll(".row-check")]
    .filter((c) => c.checked)
    .map((c) => c.closest("tr").dataset.id);
}
function updateBulk() {
  const ids = selectedIds();
  $("#selCount").textContent = ids.length;
  $("#btnMail").disabled = ids.length === 0;
  $("#btnDelete").disabled = ids.length === 0;
  const all = document.querySelectorAll(".row-check");
  $("#checkAll").checked = all.length > 0 && ids.length === all.length;
}
$("#checkAll").addEventListener("change", (e) => {
  document.querySelectorAll(".row-check").forEach((c) => (c.checked = e.target.checked));
  updateBulk();
});
$("#btnDelete").addEventListener("click", () => {
  const ids = selectedIds();
  if (!ids.length) return;
  if (!confirm(`¿Eliminar ${ids.length} registro(s)?`)) return;
  items = items.filter((x) => !ids.includes(x.id));
  save();
  animateRows = true;
  render();
});

$("#search").addEventListener("input", render);
$("#filterEstado").addEventListener("change", render);
$("#filterDateField").addEventListener("change", render);
$("#filterFrom").addEventListener("change", render);
$("#filterTo").addEventListener("change", render);

$("#btnClearFilters").addEventListener("click", () => {
  $("#search").value = "";
  $("#filterEstado").value = "";
  $("#filterDateField").value = "createdAt";
  $("#filterFrom").value = "";
  $("#filterTo").value = "";
  render();
});

/* Chips de estadística: clic para filtrar por ese estado (toggle) */
document.querySelectorAll(".stat").forEach((chip) => {
  chip.addEventListener("click", () => {
    const st = chip.dataset.stat;
    $("#filterEstado").value = $("#filterEstado").value === st ? "" : st;
    render();
  });
});

/* ============================================================
   Generación de correo
   ============================================================ */
let mailState = { ids: [], subject: "", html: "", text: "" };

function buildMail(ids) {
  const rows = ids.map((id) => items.find((x) => x.id === id)).filter(Boolean);
  /* Orden por código para que el correo quede prolijo */
  rows.sort((a, b) => String(a.sku || "").localeCompare(String(b.sku || ""), "es"));
  const isTras = MODULE === "traspasos";

  /* Expande cada registro a una fila por partida */
  const erows = rows.flatMap((r) =>
    lotesOf(r).map((l) => ({
      sku: r.sku, descripcion: r.descripcion, um: r.um,
      cantidad: l.cantidad, partida: l.partida, serie: l.serie, accion: r.accion,
    }))
  );
  const anySerie = erows.some((e) => e.serie);
  const anyPartida = erows.some((e) => e.partida);

  /* Ajustes: ¿todas las filas con la misma acción? + observaciones */
  const acciones = [...new Set(rows.map((r) => r.accion || "SUMAR"))];
  const accionUnica = !isTras && acciones.length === 1 ? acciones[0] : null;
  const mixedAccion = !isTras && acciones.length > 1;
  const obsList = isTras ? [] : rows.filter((r) => r.obs);
  const destList = isTras ? [] : rows.filter((r) => r.destSku);
  const destBits = (r) => {
    const b = [];
    if (r.destPartida) b.push("Partida: " + r.destPartida);
    if (r.destVenc) b.push("Vence: " + fmtVenc(r.destVenc));
    if (r.destSerie) b.push("Serie: " + r.destSerie);
    return b;
  };

  /* Pares Origen→Destino distintos (tabla aparte, solo traspasos) */
  const dirPairs = [];
  if (isTras) {
    const seenDir = new Set();
    rows.forEach((r) => {
      if (r.origen || r.destino) {
        const key = (r.origen || "") + "||" + (r.destino || "");
        if (!seenDir.has(key)) {
          seenDir.add(key);
          dirPairs.push({ o: r.origen || "", d: r.destino || "" });
        }
      }
    });
  }

  /* Asunto: incluye código(s); si son muchos usa la carpeta y el conteo */
  const uniqueCodes = [...new Set(rows.map((r) => r.sku).filter(Boolean))];
  const codes = uniqueCodes.join(", ");
  const folders = [...new Set(rows.map((r) => r.folder || ""))];
  const folderName = folders.length === 1 && folders[0] ? folders[0] : "";
  const defBase = isTras ? "Traspaso de existencias" : "Ajuste de inventario";
  const base = (rows.find((r) => r.asunto)?.asunto || defBase).trim();
  let subject;
  if (uniqueCodes.length <= 3) {
    subject = codes && !base.includes(codes) ? `${base} ${codes}` : base;
  } else {
    subject = folderName
      ? `${base} · ${folderName} (${uniqueCodes.length} SKU)`
      : `${base} (${uniqueCodes.length} SKU)`;
  }

  /* Línea de introducción */
  const intro = isTras
    ? "Favor hacer el siguiente traspaso"
    : accionUnica
    ? `Favor aprobar el siguiente ajuste (${accionUnica === "SUMAR" ? "sumar" : "descontar"} stock)`
    : "Favor aprobar el siguiente ajuste";

  /* --- Tabla principal --- */
  const headCells = ["CODIGO", "DESCRIPCION", "U.M", "CANTIDAD"];
  if (anyPartida) headCells.push("PARTIDA");
  if (anySerie) headCells.push("SERIE");
  if (mixedAccion) headCells.push("AJUSTE");

  const thead = headCells
    .map((h) => `<th style="background:#404040;color:#fff;padding:6px 12px;text-align:left;">${h}</th>`)
    .join("");

  const tbody = erows
    .map((r) => {
      const cells = [
        r.sku, r.descripcion, r.um, r.cantidad,
        ...(anyPartida ? [r.partida || ""] : []),
        ...(anySerie ? [r.serie || ""] : []),
        ...(mixedAccion ? [r.accion || "SUMAR"] : []),
      ];
      return (
        "<tr>" +
        cells.map((c) => `<td style="padding:6px 12px;border-bottom:1px solid #ddd;">${esc(c)}</td>`).join("") +
        "</tr>"
      );
    })
    .join("");

  /* --- Tabla aparte Origen / Destino (solo traspasos) --- */
  let dirHtml = "";
  if (dirPairs.length) {
    const thCell = (t) =>
      `<th style="background:#c0504d;color:#fff;border:1px solid #8a3733;padding:6px 16px;text-align:center;font-weight:bold;">${t}</th>`;
    const tdCell = (v) =>
      `<td style="border:1px solid #b0b0b0;padding:6px 16px;text-align:center;">${esc(v)}</td>`;
    const dirRows = dirPairs.map((p) => `<tr>${tdCell(p.o || "—")}${tdCell(p.d || "—")}</tr>`).join("");
    dirHtml =
      `<table style="border-collapse:collapse;margin:14px 0 4px;">` +
      `<thead><tr>${thCell("ORIGEN")}${thCell("DESTINO")}</tr></thead>` +
      `<tbody>${dirRows}</tbody></table>`;
  }

  /* --- Observaciones (solo ajustes) --- */
  const obsHtml = obsList.length
    ? obsList.map((r) => `<p style="margin:4px 0;color:#444;">${esc(r.obs)}</p>`).join("")
    : "";

  const destHtml = destList.length
    ? destList
        .map((r) => {
          const bits = destBits(r);
          const extra = bits.length ? " — " + bits.join(" · ") : "";
          return `<p style="margin:4px 0;">Ajustar al SKU <b>${esc(r.destSku)}</b> ${esc(r.destDesc || "")}${esc(extra)}</p>`;
        })
        .join("")
    : "";

  const tablesHtml =
    `<table style="border-collapse:collapse;">` +
    `<thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>` +
    dirHtml +
    obsHtml +
    destHtml;

  const html = `<p>Buen Día,</p>` + `<p>${intro}</p>` + tablesHtml + `<p>Saludos.</p>`;

  /* --- Texto plano --- */
  const textRows = erows
    .map((r) => {
      const parts = [r.sku, r.descripcion, r.um, r.cantidad];
      if (anyPartida) parts.push("Partida: " + (r.partida || "-"));
      if (anySerie) parts.push("Serie: " + (r.serie || "-"));
      if (mixedAccion) parts.push(r.accion || "SUMAR");
      return "- " + parts.join("  |  ");
    })
    .join("\n");
  const dirText = dirPairs.length
    ? "\n\nORIGEN  →  DESTINO\n" + dirPairs.map((p) => `${p.o || "-"}  →  ${p.d || "-"}`).join("\n")
    : "";
  const obsText = obsList.length ? "\n\n" + obsList.map((r) => r.obs).join("\n") : "";
  const destText = destList.length
    ? "\n\n" +
      destList
        .map((r) => {
          const bits = destBits(r);
          return `Ajustar al SKU ${r.destSku} ${r.destDesc || ""}${bits.length ? " — " + bits.join(" · ") : ""}`;
        })
        .join("\n")
    : "";
  const text = `Buen Día,\n\n${intro}\n\n${textRows}${dirText}${obsText}${destText}\n\nSaludos.`;

  return { ids, subject, html, text, tablesHtml, module: MODULE };
}

function openMail(ids) {
  mailState = buildMail(ids);
  $("#mAsunto").value = mailState.subject;
  $("#mailPreview").innerHTML = mailState.html;
  $("#modal").hidden = false;
}

$("#btnMail").addEventListener("click", () => {
  const ids = selectedIds();
  if (ids.length) openMail(ids);
});
function closeModal() {
  $("#modal").hidden = true;
}
$("#modalClose").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#modal").hidden) closeModal();
});

/* Copiar con formato (HTML enriquecido) */
$("#btnCopyHtml").addEventListener("click", async () => {
  const subject = $("#mAsunto").value;
  const html = `<p><b>Asunto:</b> ${esc(subject)}</p>` + mailState.html;
  try {
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([mailState.text], { type: "text/plain" });
    await navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob, "text/plain": textBlob }),
    ]);
    toast("Copiado con formato — pega en tu correo");
  } catch {
    fallbackCopy(mailState.text);
  }
});

/* Copiar texto plano */
$("#btnCopyText").addEventListener("click", async () => {
  const full = `Asunto: ${$("#mAsunto").value}\n\n${mailState.text}`;
  try {
    await navigator.clipboard.writeText(full);
    toast("Texto copiado");
  } catch {
    fallbackCopy(full);
  }
});

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  toast("Copiado");
}

/* Abrir cliente de correo */
$("#btnMailto").addEventListener("click", () => {
  const subject = encodeURIComponent($("#mAsunto").value);
  const body = encodeURIComponent(mailState.text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

/* Marcar como ENVIADO */
$("#btnMarkSent").addEventListener("click", () => {
  mailState.ids.forEach((id) => {
    const it = items.find((x) => x.id === id);
    if (it) setEstado(it, "ENVIADO");
  });
  save();
  animateRows = true;
  render();
  $("#modal").hidden = true;
  toast("Marcados como ENVIADO");
});

/* ============================================================
   Asistente de IA (Claude) — redacta el correo
   Llama a la API de Anthropic directamente desde el navegador.
   La clave se guarda solo en este navegador (localStorage).
   ============================================================ */
const AI_KEY_STORAGE = "anthropic_key";
const AI_MODEL = "claude-opus-4-8";

const getAIKey = () => localStorage.getItem(AI_KEY_STORAGE) || "";

function openAIModal() {
  $("#aiKey").value = getAIKey();
  $("#aiModal").hidden = false;
}
$("#aiClose").addEventListener("click", () => ($("#aiModal").hidden = true));
$("#aiModal").addEventListener("click", (e) => {
  if (e.target.id === "aiModal") $("#aiModal").hidden = true;
});
$("#aiForget").addEventListener("click", () => {
  localStorage.removeItem(AI_KEY_STORAGE);
  $("#aiKey").value = "";
  toast("Clave eliminada de este navegador");
});
$("#aiSave").addEventListener("click", () => {
  const k = $("#aiKey").value.trim();
  if (!k) {
    toast("Pega tu clave API");
    return;
  }
  localStorage.setItem(AI_KEY_STORAGE, k);
  $("#aiModal").hidden = true;
  enhanceWithAI();
});

$("#btnAI").addEventListener("click", () => {
  if (!getAIKey()) {
    openAIModal();
    return;
  }
  enhanceWithAI();
});

async function enhanceWithAI() {
  const key = getAIKey();
  if (!key || !mailState.tablesHtml) return;

  const btn = $("#btnAI");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "✨ Redactando…";
  toast("Redactando con IA…");

  const tipo =
    mailState.module === "ajustes" ? "ajuste de inventario" : "traspaso de existencias";
  const prompt =
    `Redacta un correo profesional, claro y cordial en español para una solicitud de ${tipo} ` +
    `dirigida al área de bodega. Devuelve ÚNICAMENTE un objeto JSON válido (sin texto adicional, ` +
    `sin bloques de código) con exactamente estas claves:\n` +
    `- "asunto": string breve y descriptivo (incluye el/los código(s) si aplica)\n` +
    `- "intro_html": 1 o 2 párrafos en HTML (<p>…</p>) de saludo y contexto que introducen la solicitud\n` +
    `- "cierre_html": 1 párrafo en HTML (<p>…</p>) de despedida cortés\n\n` +
    `No incluyas la tabla de productos: se agrega aparte. No inventes datos. ` +
    `Asunto actual: ${mailState.subject}\n\n` +
    `Detalle de la solicitud:\n${mailState.text}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try {
        const e = await res.json();
        if (e?.error?.message) msg = e.error.message;
      } catch {}
      if (res.status === 401) msg = "Clave API inválida";
      toast("IA: " + msg);
      return;
    }

    const data = await res.json();
    const textOut = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = parseAIJson(textOut);
    if (!parsed) {
      toast("No se pudo interpretar la respuesta de IA");
      return;
    }

    if (parsed.asunto) {
      mailState.subject = String(parsed.asunto).trim();
      $("#mAsunto").value = mailState.subject;
    }
    const intro = parsed.intro_html || "";
    const cierre = parsed.cierre_html || "<p>Saludos.</p>";
    mailState.html = intro + mailState.tablesHtml + cierre;
    $("#mailPreview").innerHTML = mailState.html;
    /* Texto plano: quita etiquetas HTML de la prosa */
    const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
    mailState.text =
      strip(intro) + "\n\n" + mailState.text.split("\n").slice(2).join("\n");

    toast("Correo mejorado con IA ✨");
  } catch (err) {
    toast("IA: error de red o CORS (" + err.message + ")");
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

/* Extrae el primer objeto JSON de la respuesta (tolera ```json … ```) */
function parseAIJson(text) {
  if (!text) return null;
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(t);
  } catch {}
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(t.slice(a, b + 1));
    } catch {}
  }
  return null;
}

/* Escape global con IA modal */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#aiModal").hidden) $("#aiModal").hidden = true;
});

/* ============================================================
   Sincronización en la nube (Firebase / Firestore REST)
   Guarda los registros en la nube para verlos iguales en todos
   los dispositivos. Llama a la API REST de Firestore con fetch.
   ============================================================ */
const SYNC_CFG = "sync_cfg"; // {projectId, apiKey, space}
const SYNC_REV = "sync_rev"; // timestamp de los datos que tenemos
let _pushTimer = null;
let _pollTimer = null;
let _dirty = false;

function syncCfg() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_CFG));
  } catch {
    return null;
  }
}
function syncEnabled() {
  const c = syncCfg();
  return !!(c && c.projectId && c.apiKey);
}
function getRev() {
  return parseInt(localStorage.getItem(SYNC_REV) || "0", 10);
}
function setRev(v) {
  localStorage.setItem(SYNC_REV, String(v));
}
function syncDocUrl() {
  const c = syncCfg();
  const space = (c.space || "default").replace(/[^A-Za-z0-9_-]/g, "") || "default";
  return (
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}` +
    `/databases/(default)/documents/emil/${encodeURIComponent(space)}?key=${encodeURIComponent(c.apiKey)}`
  );
}
function fullPayload() {
  return {
    traspasos: JSON.parse(localStorage.getItem(STORAGE_KEYS.traspasos) || "[]"),
    ajustes: JSON.parse(localStorage.getItem(STORAGE_KEYS.ajustes) || "[]"),
  };
}
function localCount() {
  const p = fullPayload();
  return (p.traspasos.length || 0) + (p.ajustes.length || 0);
}

function updateSyncBadge(state, info) {
  const b = $("#btnSync");
  if (b) b.classList.toggle("on", syncEnabled());
  if (!$("#syncModal")) return;
  if (state !== undefined) $("#syncState").textContent = state;
  if (info !== undefined) $("#syncInfo").textContent = info;
}

async function syncPull(apply) {
  if (!syncEnabled()) return null;
  const res = await fetch(syncDocUrl());
  if (res.status === 404) return { rev: 0, missing: true };
  if (!res.ok) throw new Error("HTTP " + res.status);
  const doc = await res.json();
  const f = doc.fields || {};
  const rev = parseInt(f.rev?.integerValue || "0", 10);
  let payload = null;
  try {
    payload = JSON.parse(f.data?.stringValue || "");
  } catch {}
  if (apply && payload && rev > getRev()) {
    localStorage.setItem(STORAGE_KEYS.traspasos, JSON.stringify(payload.traspasos || []));
    localStorage.setItem(STORAGE_KEYS.ajustes, JSON.stringify(payload.ajustes || []));
    setRev(rev);
    items = load();
    if (migrate(items)) localStorage.setItem(STORAGE_KEYS[MODULE], JSON.stringify(items));
    animateRows = true;
    render();
  }
  return { rev, payload };
}

async function syncPush() {
  if (!syncEnabled()) return;
  const rev = Date.now();
  const body = {
    fields: {
      data: { stringValue: JSON.stringify(fullPayload()) },
      rev: { integerValue: String(rev) },
    },
  };
  const res = await fetch(syncDocUrl(), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  setRev(rev);
  _dirty = false;
}

function schedulePush() {
  if (!syncEnabled()) return;
  _dirty = true;
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => {
    syncPush()
      .then(() => updateSyncBadge("Sincronizado", "guardado " + fmtDate(Date.now())))
      .catch((e) => updateSyncBadge("Error al guardar", e.message));
  }, 1200);
}

function startSyncPoll() {
  clearInterval(_pollTimer);
  if (!syncEnabled()) return;
  _pollTimer = setInterval(() => {
    if (_dirty) return;
    syncPull(true).catch(() => {});
  }, 12000);
}

async function syncStartup() {
  updateSyncBadge(syncEnabled() ? "Conectando…" : "Desconectado", "");
  if (!syncEnabled()) return;
  try {
    const r = await syncPull(false);
    const remoteRev = r.rev || 0;
    if (getRev() === 0 && remoteRev > 0 && localCount() > 0) {
      // Primer enlace en este dispositivo con datos en ambos lados → preguntar
      const up = confirm(
        `Este dispositivo tiene ${localCount()} registro(s) y la nube ya tiene datos.\n\n` +
          `Aceptar = SUBIR los de este dispositivo (reemplaza la nube)\n` +
          `Cancelar = TRAER los de la nube (reemplaza este dispositivo)`
      );
      if (up) await syncPush();
      else {
        setRev(0);
        await syncPull(true);
      }
    } else if (remoteRev > getRev()) {
      await syncPull(true);
    } else {
      if (getRev() === 0) setRev(Date.now());
      await syncPush();
    }
    updateSyncBadge("Sincronizado", "");
  } catch (e) {
    updateSyncBadge("Error", e.message);
  }
  startSyncPoll();
}

$("#btnSync").addEventListener("click", () => {
  const c = syncCfg() || {};
  $("#syncProject").value = c.projectId || "";
  $("#syncKey").value = c.apiKey || "";
  $("#syncSpace").value = c.space || "default";
  updateSyncBadge();
  $("#syncModal").hidden = false;
});
$("#syncClose").addEventListener("click", () => ($("#syncModal").hidden = true));
$("#syncModal").addEventListener("click", (e) => {
  if (e.target.id === "syncModal") $("#syncModal").hidden = true;
});
$("#syncSave").addEventListener("click", () => {
  const cfg = {
    projectId: $("#syncProject").value.trim(),
    apiKey: $("#syncKey").value.trim(),
    space: $("#syncSpace").value.trim() || "default",
  };
  if (!cfg.projectId || !cfg.apiKey) {
    toast("Completa Project ID y API Key");
    return;
  }
  localStorage.setItem(SYNC_CFG, JSON.stringify(cfg));
  setRev(0); // forzar reconciliación inicial
  toast("Conectando a la nube…");
  syncStartup().then(() => toast("Sincronización activada"));
});
$("#syncNow").addEventListener("click", () => {
  if (!syncEnabled()) {
    toast("Primero conecta la nube");
    return;
  }
  toast("Sincronizando…");
  syncPull(true)
    .then((r) => {
      if (r && r.rev <= getRev()) return syncPush();
    })
    .then(() => updateSyncBadge("Sincronizado", ""))
    .then(() => toast("Listo"))
    .catch((e) => toast("Error: " + e.message));
});
$("#syncOff").addEventListener("click", () => {
  localStorage.removeItem(SYNC_CFG);
  clearInterval(_pollTimer);
  updateSyncBadge("Desconectado", "");
  toast("Sincronización desactivada");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#syncModal") && !$("#syncModal").hidden) $("#syncModal").hidden = true;
});

/* ============================================================
   Importar / Exportar
   ============================================================ */
$("#btnExport").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${MODULE}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});
$("#btnImport").addEventListener("click", () => $("#fileImport").click());
$("#fileImport").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("Formato inválido");
      const merge = confirm("Aceptar = combinar con los actuales\nCancelar = reemplazar todo");
      items = merge ? [...data, ...items] : data;
      /* asegurar ids únicos */
      const seen = new Set();
      items.forEach((it) => {
        if (!it.id || seen.has(it.id)) it.id = uid();
        seen.add(it.id);
      });
      save();
      animateRows = true;
      render();
      toast("Importado correctamente");
    } catch (err) {
      toast("Error al importar: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

/* ============================================================
   Módulos: Traspasos / Ajustes de inventario
   ============================================================ */
function applyModuleUI() {
  const isTras = MODULE === "traspasos";
  document.body.classList.toggle("mode-ajustes", !isTras);
  $("#secMovimiento").hidden = !isTras;
  $("#secAjuste").hidden = isTras;
  $("#thCol8").textContent = isTras ? "Directriz" : "Ajuste";
  $("#search").placeholder = isTras
    ? "🔍 Buscar por SKU, descripción, partida, serie…"
    : "🔍 Buscar por SKU, descripción, acción, observación…";
  document.querySelectorAll(".tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.module === MODULE)
  );
}

function switchModule(m) {
  if (m === MODULE) return;
  save(); // conserva el módulo actual
  MODULE = m;
  localStorage.setItem("module", m);
  items = load();
  if (migrate(items)) save();
  editingId = null;
  activeFolder = "";
  exitEdit();
  resetForm();
  // limpia filtros al cambiar de módulo
  $("#search").value = "";
  $("#filterEstado").value = "";
  $("#filterFrom").value = "";
  $("#filterTo").value = "";
  applyModuleUI();
  animateRows = true;
  render();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchModule(tab.dataset.module));
});
applyModuleUI();

/* ============================================================
   Tema (claro / oscuro)
   ============================================================ */
function applyThemeIcon() {
  const dark = document.documentElement.dataset.theme === "dark";
  const btn = $("#themeToggle");
  btn.textContent = dark ? "☀️" : "🌙";
  btn.title = dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
}
$("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  applyThemeIcon();
});
applyThemeIcon();

/* ============================================================
   Actualización del catálogo (subir Excel en la app)
   ============================================================ */
/* Carga SheetJS solo cuando se necesita (881 KB) */
let _xlsxPromise = null;
function ensureXLSX() {
  if (window.XLSX) return Promise.resolve();
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "vendor/xlsx.full.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("No se pudo cargar el lector de Excel"));
    document.head.appendChild(s);
  });
  return _xlsxPromise;
}

const CAT_SKIP = new Set(["codigo", "código", "cod. producto", "cod producto"]);
const CAT_TARGET_SHEETS = ["matriz farmapack", "matriz ptm"];

function parseCatalogWorkbook(wb) {
  const map = new Map();
  let sheets = wb.SheetNames.filter((n) => CAT_TARGET_SHEETS.includes(n.toLowerCase().trim()));
  if (!sheets.length) sheets = wb.SheetNames; // si no encuentra las hojas, lee todas
  for (const name of sheets) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false });
    for (const row of rows) {
      if (!row || row.length < 2) continue;
      let code = row[0];
      if (code === null || code === undefined) continue;
      code = String(code).trim();
      if (!code || CAT_SKIP.has(code.toLowerCase())) continue;
      const desc = row[1] === null || row[1] === undefined ? "" : String(row[1]).trim();
      if (!desc) continue;
      const um = row[2] === null || row[2] === undefined ? "" : String(row[2]).trim();
      map.set(code, { c: code, d: desc, u: um });
    }
  }
  return [...map.values()];
}

function applyCatalogItems(items, { merge }) {
  let next = items;
  if (merge) {
    const m = new Map(CATALOG.map((p) => [String(p.c), p]));
    items.forEach((p) => m.set(String(p.c), p));
    next = [...m.values()];
  }
  CATALOG = next;
  catalogStore = { items: next, updatedAt: Date.now() };
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalogStore));
  rebuildCatalogIndex();
}

function restoreDefaultCatalog() {
  localStorage.removeItem(CATALOG_KEY);
  catalogStore = null;
  CATALOG = DEFAULT_CATALOG;
  rebuildCatalogIndex();
}

function refreshCatalogModal() {
  $("#catCount").textContent = CATALOG.length.toLocaleString("es");
  $("#catSource").textContent = catalogStore
    ? "Actualizado el " + fmtDate(catalogStore.updatedAt)
    : "Catálogo predeterminado";
}

$("#btnCatalog").addEventListener("click", () => {
  refreshCatalogModal();
  $("#catModal").hidden = false;
});
$("#catClose").addEventListener("click", () => ($("#catModal").hidden = true));
$("#catModal").addEventListener("click", (e) => {
  if (e.target.id === "catModal") $("#catModal").hidden = true;
});

$("#catFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  toast("Procesando archivo…");
  try {
    await ensureXLSX();
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const items = parseCatalogWorkbook(wb);
    if (!items.length) {
      toast("No se encontraron productos válidos en el archivo");
      return;
    }
    applyCatalogItems(items, { merge: $("#catMerge").checked });
    refreshCatalogModal();
    toast(`Catálogo actualizado: ${CATALOG.length.toLocaleString("es")} productos`);
  } catch (err) {
    toast("Error al leer el Excel: " + err.message);
  } finally {
    e.target.value = "";
  }
});

$("#catRestore").addEventListener("click", () => {
  if (!catalogStore) {
    toast("Ya estás usando el catálogo predeterminado");
    return;
  }
  if (!confirm("¿Restaurar el catálogo predeterminado y descartar el actualizado?")) return;
  restoreDefaultCatalog();
  refreshCatalogModal();
  toast("Catálogo predeterminado restaurado");
});

/* Cerrar cualquier modal con Escape */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#catModal").hidden) $("#catModal").hidden = true;
});

/* ============================================================
   Efecto ripple en botones
   ============================================================ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn || btn.disabled) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.width = r.style.height = size + "px";
  r.style.left = e.clientX - rect.left - size / 2 + "px";
  r.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
});

/* ============================================================
   Init
   ============================================================ */
fillFolderSelect();
render();
syncStartup();
