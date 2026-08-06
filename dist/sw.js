if (!self.define) {
  let s,
    e = {};
  const l = (l, n) => (
    (l = new URL(l + '.js', n).href),
    e[l] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = l), (s.onload = e), document.head.appendChild(s));
        } else ((s = l), importScripts(l), e());
      }).then(() => {
        let s = e[l];
        if (!s) throw new Error(`Module ${l} didn’t register its module`);
        return s;
      })
  );
  self.define = (n, i) => {
    const r = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[r]) return;
    let u = {};
    const a = (s) => l(s, r),
      o = { module: { uri: r }, exports: u, require: a };
    e[r] = Promise.all(n.map((s) => o[s] || a(s))).then((s) => (i(...s), u));
  };
}
define(['./workbox-8925e955'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: 'b6fd61013ebea61e44dc25282424e051' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DPMOPODy.js', revision: null },
        { url: 'assets/WmsLocations-Dvv_ZwdY.js', revision: null },
        { url: 'assets/web-JdD3Z7Xr.js', revision: null },
        { url: 'assets/web-BJVGtjtf.js', revision: null },
        { url: 'assets/web-B7EHkV31.js', revision: null },
        { url: 'assets/warehouseStore-B4rRIOTb.js', revision: null },
        { url: 'assets/WarehousePDA-Bk_5-0Oj.js', revision: null },
        { url: 'assets/Views-CjQPT-3S.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-C1vtwbQw.js', revision: null },
        { url: 'assets/useRealtimeTable-D3K1DC9j.js', revision: null },
        { url: 'assets/useBarcodeScanner-COJuZ8Sf.js', revision: null },
        { url: 'assets/UploadHistory-BOtZvHMM.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-Djy2qNIW.js', revision: null },
        { url: 'assets/Traspasos-WWpWsITb.js', revision: null },
        { url: 'assets/Transporte-DE5kNtsv.js', revision: null },
        { url: 'assets/Tickets-z2l4hXGl.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Cmmd6Sc1.js', revision: null },
        { url: 'assets/SolicitudPublica-D2qczs7G.js', revision: null },
        { url: 'assets/Seguridad-CzFjZfPm.js', revision: null },
        { url: 'assets/securityService-1JaEy0FR.js', revision: null },
        { url: 'assets/SalesStatus-Cc-6PaD1.js', revision: null },
        { url: 'assets/ReceptionNacional-D4WmqDlh.js', revision: null },
        { url: 'assets/Reception-BtJ0Ma2f.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-C6nvEOiM.js', revision: null },
        { url: 'assets/Postventa-BQixOjF1.js', revision: null },
        { url: 'assets/PodCapture-CYB2csAV.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-ChZcl_N3.js', revision: null },
        { url: 'assets/panelPtm-K1qhGLm3.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BHr8CrWn.js', revision: null },
        { url: 'assets/PanelInfoReal-ChK9g0xG.js', revision: null },
        { url: 'assets/PanelConfigReal-C7iuqvmc.js', revision: null },
        { url: 'assets/PanelBuilderReal-Im3L3QDV.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-B0OSI0gR.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-BY7TYhG4.js', revision: null },
        { url: 'assets/MiRuta-DV_MV0hq.js', revision: null },
        { url: 'assets/MiBandeja-Bz1cbmEJ.js', revision: null },
        { url: 'assets/logUpload-QIb97CvA.js', revision: null },
        { url: 'assets/Login-BecSeXac.js', revision: null },
        { url: 'assets/LocationManager-Be1UhVfP.js', revision: null },
        { url: 'assets/Insumos-BTY88UvH.js', revision: null },
        { url: 'assets/index-x1KvlwFV.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CvnzWbLN.css', revision: null },
        { url: 'assets/index-C2HEogTn.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-By7zye9J.js', revision: null },
        { url: 'assets/HistorialNV-D8JFeCCQ.js', revision: null },
        { url: 'assets/Heatmap-C06ekVTM.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-B9JgM2K5.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-QOE1CBj8.js', revision: null },
        { url: 'assets/Entry-BDFT637Y.js', revision: null },
        { url: 'assets/DispatchControl-BOytkgCF.js', revision: null },
        { url: 'assets/DataImport-CV45PPQm.js', revision: null },
        { url: 'assets/dashData-DmDG0d9D.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CTkTHkxs.js', revision: null },
        { url: 'assets/CubingRegistry-Nqec9yAP.js', revision: null },
        { url: 'assets/conteoService-DFb_xy7C.js', revision: null },
        { url: 'assets/ConteoCiclico-BHdppJPl.js', revision: null },
        { url: 'assets/ConsultaNV-DpJWOg8g.js', revision: null },
        { url: 'assets/ConsultaGrupo-g0AcLrLj.js', revision: null },
        { url: 'assets/configService-BF9dOS1M.js', revision: null },
        { url: 'assets/comunasChile-CIfSXc0a.js', revision: null },
        { url: 'assets/Cleanup-DgGqcqIe.js', revision: null },
        { url: 'assets/ClasificacionProductos-uugWUs3f.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-BeoFm-aJ.js', revision: null },
        { url: 'assets/calidadService-CLdbYaPe.js', revision: null },
        { url: 'assets/CalidadBadge-B1kmctid.js', revision: null },
        { url: 'assets/BodegasSoftland-iJUpv2R6.js', revision: null },
        { url: 'assets/BloqueDetalle-DegYShHq.js', revision: null },
        { url: 'assets/Batches-pTmYKHjJ.js', revision: null },
        { url: 'assets/ApiKeys-CqWuSlrw.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-De2Zl55N.js', revision: null },
        { url: 'assets/AdminMonitor-7s1eKpTg.js', revision: null },
        { url: 'assets/Addresses-Dh4vAMJO.js', revision: null },
        { url: 'assets/AccionIntegracion-BQ8SG9cH.js', revision: null },
        { url: 'assets/AccionesCalidad-Jk5iUWD-.js', revision: null },
        { url: 'assets/AccessControl-B3Id7bL4.js', revision: null },
        { url: 'manifest.webmanifest', revision: '344a1b27417ccd5be28709f2f5b53f37' }
      ],
      {}
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      new s.NavigationRoute(s.createHandlerBoundToURL('index.html'), {
        denylist: [/^\/traspasos\//]
      })
    ),
    s.registerRoute(
      /^https:\/\/.*\.supabase\.co\/rest\/v1\/app_runtime_control.*/i,
      new s.NetworkOnly(),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/.*\.supabase\.co\/rest\/v1\/(tms_skus|tms_ubicaciones|tms_conductores|tms_vehiculos).*/i,
      new s.StaleWhileRevalidate({
        cacheName: 'supabase-reference-data',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 604800 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] })
        ]
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/.*\.supabase\.co\/.*/i,
      new s.NetworkFirst({
        cacheName: 'supabase-api-cache',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] })
        ]
      }),
      'GET'
    ));
});
