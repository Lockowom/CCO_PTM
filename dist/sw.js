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
        { url: 'index.html', revision: '6fcdbcccb03bef79b9c27f5fe992ca66' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DqRDXUN9.js', revision: null },
        { url: 'assets/WmsLocations-BuQlYP91.js', revision: null },
        { url: 'assets/web-D5E6BzlI.js', revision: null },
        { url: 'assets/web-CYGsdHWr.js', revision: null },
        { url: 'assets/web-B5hfkJKU.js', revision: null },
        { url: 'assets/warehouseStore-BX98w6UE.js', revision: null },
        { url: 'assets/WarehousePDA-D-QdssdP.js', revision: null },
        { url: 'assets/Views-DNkTA1qN.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado--O-fAC76.js', revision: null },
        { url: 'assets/useRealtimeTable-fbyVHirV.js', revision: null },
        { url: 'assets/useBarcodeScanner-Bs7O2NYF.js', revision: null },
        { url: 'assets/UploadHistory-CdYw6oEg.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-D3r6LMww.js', revision: null },
        { url: 'assets/Traspasos-D5HJ11Ny.js', revision: null },
        { url: 'assets/Transporte-9vihYYyG.js', revision: null },
        { url: 'assets/Tickets-CVNfdRSl.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-o_giIXns.js', revision: null },
        { url: 'assets/SolicitudPublica-BZW9Yi3d.js', revision: null },
        { url: 'assets/Seguridad-PT117n_B.js', revision: null },
        { url: 'assets/securityService-Dxo39UNr.js', revision: null },
        { url: 'assets/SalesStatus-pQQoC2bH.js', revision: null },
        { url: 'assets/ReceptionNacional-C0Ir-jQ7.js', revision: null },
        { url: 'assets/Reception-D9Xqc7tI.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-_bCgX2y5.js', revision: null },
        { url: 'assets/Postventa-Cf_bs31O.js', revision: null },
        { url: 'assets/PodCapture-DEysJuVT.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-BCBz2-uM.js', revision: null },
        { url: 'assets/panelPtm-CH5cTgO4.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-DyG9tqE0.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-ChJr4fXX.js', revision: null },
        { url: 'assets/PanelConfigReal-CFmxl4Qc.js', revision: null },
        { url: 'assets/PanelBuilderReal-CW21Nza_.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-DQ0CBnFg.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-Vc4hx4A2.js', revision: null },
        { url: 'assets/MiRuta-DGqW3QLI.js', revision: null },
        { url: 'assets/MiBandeja-CVoxlBmn.js', revision: null },
        { url: 'assets/logUpload-DUOWTMMI.js', revision: null },
        { url: 'assets/Login-CCFj7jjj.js', revision: null },
        { url: 'assets/LocationManager-DeJwFIhM.js', revision: null },
        { url: 'assets/Insumos-Chs2SW_k.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-DDzGWu74.js', revision: null },
        { url: 'assets/index-CvnzWbLN.css', revision: null },
        { url: 'assets/index-Cl3qi7_W.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-BI9z_m2l.js', revision: null },
        { url: 'assets/HistorialNV-Gz6RklVa.js', revision: null },
        { url: 'assets/Heatmap-BsXORXZQ.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-GZAIELoF.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-B0r_7GBp.js', revision: null },
        { url: 'assets/Entry-Dg4UZCnU.js', revision: null },
        { url: 'assets/DispatchControl-BUlUNZnE.js', revision: null },
        { url: 'assets/DataImport-BOUQHL6v.js', revision: null },
        { url: 'assets/dashData-D-yCu9Iw.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CdZaEJBT.js', revision: null },
        { url: 'assets/CubingRegistry-BwM_1P_A.js', revision: null },
        { url: 'assets/conteoService-ChITnoD8.js', revision: null },
        { url: 'assets/ConteoCiclico-BZkxe3kK.js', revision: null },
        { url: 'assets/ConsultaNV-Blwc49G-.js', revision: null },
        { url: 'assets/ConsultaGrupo-pz5Wv15u.js', revision: null },
        { url: 'assets/configService-sFSDbE3u.js', revision: null },
        { url: 'assets/comunasChile-DGkeDKC6.js', revision: null },
        { url: 'assets/Cleanup-DEKncT5h.js', revision: null },
        { url: 'assets/ClasificacionProductos-DwnKVzuF.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CEVX-N_f.js', revision: null },
        { url: 'assets/calidadService-CJrJdq9w.js', revision: null },
        { url: 'assets/CalidadBadge-Btg5zeYQ.js', revision: null },
        { url: 'assets/BodegasSoftland-BuWws6rh.js', revision: null },
        { url: 'assets/BloqueDetalle-SIbwad5I.js', revision: null },
        { url: 'assets/Batches-D4R2MnlL.js', revision: null },
        { url: 'assets/ApiKeys-CNkqEEpb.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DkZiXJZT.js', revision: null },
        { url: 'assets/AdminMonitor-Bu5DM5w3.js', revision: null },
        { url: 'assets/Addresses-DSCJkSbf.js', revision: null },
        { url: 'assets/AccionIntegracion-Ck0yoWTA.js', revision: null },
        { url: 'assets/AccionesCalidad-C2HYHs6N.js', revision: null },
        { url: 'assets/AccessControl-3T8E99uG.js', revision: null },
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
