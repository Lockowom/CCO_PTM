/* ============================================================
   cco-bridge.js — Puente CCO_PTM ↔ Supabase para el módulo
   Inventario → Traspasos/Ajustes (app em-il vendorizada).

   Objetivo: conservar TODA la lógica de app.js (persistencia,
   render, migraciones, badge de sync) y sólo REEMPLAZAR el
   transporte de sincronización (originalmente Firestore REST)
   por tablas de Supabase, sin editar app.js (así el módulo
   sigue siendo actualizable con `npm run update:traspasos`).

   Estrategia:
     1) Sembramos un `sync_cfg` en localStorage para que
        syncEnabled() sea true.
     2) Redirigimos syncDocUrl() a una URL centinela.
     3) Interceptamos window.fetch: cuando la URL es la centinela
        traducimos el documento con forma Firestore
        ({fields:{rev,data}}) a filas de Supabase:
          - tms_emil_sync     (historial {traspasos, ajustes})
          - tms_emil_catalogo (catálogo maestro de SKUs)
     4) Re-ejecutamos syncStartup() (app.js ya lo llamó una vez
        con sync deshabilitado) y sembramos el catálogo.

   Autenticación: usa el access_token de la sesión de CCO, que
   vive en el localStorage del mismo origen (el iframe es
   same-origin), y la anon key pública de Supabase.
   ============================================================ */
(function () {
  "use strict";
  if (window.__ccoEmilBridge) return;
  window.__ccoEmilBridge = true;

  var SUPA_URL = "https://vtrtyzbgpsvqwbfoudaf.supabase.co";
  var SUPA_ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5emJncHN2cXdiZm91ZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzMwMDQsImV4cCI6MjA4NjMwOTAwNH0.NijuPeeOMwLyM8H_AiagKXEut1TMr2qkQZ6CHLn4RSM";
  var AUTH_LS_KEY = "sb-vtrtyzbgpsvqwbfoudaf-auth-token";
  var SPACE = "default";
  var SENTINEL = "https://cco-emil-sync.local/";
  var REST = SUPA_URL + "/rest/v1/";

  var origFetch = window.fetch.bind(window);

  /* ---------- Auth ---------- */
  function accessToken() {
    try {
      var raw = localStorage.getItem(AUTH_LS_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (
        o.access_token ||
        (o.currentSession && o.currentSession.access_token) ||
        null
      );
    } catch (e) {
      return null;
    }
  }
  function headers(extra) {
    var t = accessToken();
    var h = {
      apikey: SUPA_ANON,
      Authorization: "Bearer " + (t || SUPA_ANON),
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  /* ---------- Transporte: historial (tms_emil_sync) ---------- */
  async function supaSyncGet() {
    var url =
      REST +
      "tms_emil_sync?space=eq." +
      encodeURIComponent(SPACE) +
      "&select=rev,data";
    var res = await origFetch(url, { headers: headers({ Accept: "application/json" }) });
    if (!res.ok) throw new Error("supa GET " + res.status);
    var rows = await res.json();
    return rows && rows[0] ? rows[0] : null;
  }
  async function supaSyncPut(rev, dataObj) {
    var url = REST + "tms_emil_sync?on_conflict=space";
    var res = await origFetch(url, {
      method: "POST",
      headers: headers({
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify({ space: SPACE, rev: rev, data: dataObj }),
    });
    if (!res.ok) throw new Error("supa PUT " + res.status);
  }

  /* ---------- Transporte: catálogo (tms_emil_catalogo) ---------- */
  async function supaCatGet() {
    var url = REST + "tms_emil_catalogo?id=eq.master&select=data,updated_at";
    var res = await origFetch(url, { headers: headers({ Accept: "application/json" }) });
    if (!res.ok) throw new Error("cat GET " + res.status);
    var rows = await res.json();
    return rows && rows[0] ? rows[0] : null;
  }
  async function supaCatPut(dataArr) {
    var url = REST + "tms_emil_catalogo?on_conflict=id";
    var res = await origFetch(url, {
      method: "POST",
      headers: headers({
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify({ id: "master", data: dataArr }),
    });
    if (!res.ok) throw new Error("cat PUT " + res.status);
  }

  /* ---------- Shim de fetch para la URL centinela ---------- */
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf(SENTINEL) !== 0) return origFetch(input, init);

    var method =
      (init && init.method) ||
      (typeof input !== "string" && input && input.method) ||
      "GET";
    method = String(method).toUpperCase();

    if (method === "PATCH") {
      return (async function () {
        try {
          var body = JSON.parse((init && init.body) || "{}");
          var f = body.fields || {};
          var stringValue = f.data && f.data.stringValue;
          var rev = parseInt((f.rev && f.rev.integerValue) || "0", 10);
          var dataObj = JSON.parse(stringValue || "{}");
          await supaSyncPut(rev, dataObj);
          return new Response("{}", {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: String(e) }), {
            status: 500,
          });
        }
      })();
    }

    // GET → devolver documento con forma Firestore
    return (async function () {
      try {
        var row = await supaSyncGet();
        if (!row) return new Response("", { status: 404 });
        var doc = {
          fields: {
            rev: { integerValue: String(row.rev || 0) },
            data: { stringValue: JSON.stringify(row.data || {}) },
          },
        };
        return new Response(JSON.stringify(doc), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 500,
        });
      }
    })();
  };

  /* ---------- Catálogo maestro en Supabase ---------- */
  async function seedCatalog() {
    try {
      var remote = await supaCatGet();
      var haveRemote =
        remote && Array.isArray(remote.data) && remote.data.length;
      if (!haveRemote) {
        // Primera vez: sembrar Supabase desde el catálogo estático.
        var def = Array.isArray(window.CATALOG) ? window.CATALOG : [];
        if (def.length) await supaCatPut(def);
        return;
      }
      // Ya existe maestro → aplicarlo local si cambió.
      var sig = String(remote.updated_at || remote.data.length);
      if (localStorage.getItem("cco_emil_cat_sig") === sig) return;
      if (typeof window.applyCatalogItems === "function") {
        window.applyCatalogItems(remote.data, { merge: false });
        localStorage.setItem("cco_emil_cat_sig", sig);
      }
    } catch (e) {
      /* silencioso: se mantiene el catálogo predeterminado */
    }
  }

  /* ---------- Activación ---------- */
  try {
    localStorage.setItem(
      "sync_cfg",
      JSON.stringify({ projectId: "cco-supabase", apiKey: "cco", space: SPACE })
    );
  } catch (e) {}

  // Redirigir el transporte al centinela (app.js define syncDocUrl global).
  window.syncDocUrl = function () {
    return SENTINEL + SPACE;
  };

  function boot() {
    try {
      if (typeof window.syncStartup === "function") window.syncStartup();
    } catch (e) {}
    seedCatalog();
  }

  // app.js ya corrió su init síncrono; arrancamos en el próximo tick.
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      setTimeout(boot, 0);
    });
  }
})();
