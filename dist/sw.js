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
define(['./workbox-d8d3a357'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '4be97a350ab9508373724a8cda95b005' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-5MiVTxjG.js', revision: null },
        { url: 'assets/WmsLocations-BaKCU0rs.js', revision: null },
        { url: 'assets/web-Z0aAbj98.js', revision: null },
        { url: 'assets/web-Dt7u-hcg.js', revision: null },
        { url: 'assets/web-COrUJaYA.js', revision: null },
        { url: 'assets/warehouseStore-CCcRJAKY.js', revision: null },
        { url: 'assets/WarehousePDA-CxD7aJ_T.js', revision: null },
        { url: 'assets/Views-CTF7dxqf.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-BBOdTFRX.js', revision: null },
        { url: 'assets/useRealtimeTable-BVhYZbd0.js', revision: null },
        { url: 'assets/useBarcodeScanner-B9dLTZoL.js', revision: null },
        { url: 'assets/UploadHistory-DEVMToTd.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-D-mYMXXA.js', revision: null },
        { url: 'assets/Traspasos-DdIrc_WL.js', revision: null },
        { url: 'assets/Transporte-B7HxiJO1.js', revision: null },
        { url: 'assets/Tickets-CbFHKAH9.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-e5HnnFFQ.js', revision: null },
        { url: 'assets/SolicitudPublica-DriWsWLy.js', revision: null },
        { url: 'assets/Seguridad-DM3xTDEH.js', revision: null },
        { url: 'assets/securityService-CwXHnuqT.js', revision: null },
        { url: 'assets/SalesStatus-Cgj1_cDo.js', revision: null },
        { url: 'assets/ReceptionNacional-u0xzpZEP.js', revision: null },
        { url: 'assets/Reception-XJmS3nUd.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-DBZ7D-Ny.js', revision: null },
        { url: 'assets/Postventa-w2Z4Akfg.js', revision: null },
        { url: 'assets/PodCapture-D46ZDkTs.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-dM0gkzL7.js', revision: null },
        { url: 'assets/panelPtm-d7u6n4zw.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-C0eXbQ56.js', revision: null },
        { url: 'assets/PanelInfoReal-DUuBzOyC.js', revision: null },
        { url: 'assets/PanelConfigReal-B_Bui3FS.js', revision: null },
        { url: 'assets/PanelBuilderReal-DC8vqDLo.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-zsi3sCom.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-Dd1eSRHe.js', revision: null },
        { url: 'assets/MiRuta-XgFlThEY.js', revision: null },
        { url: 'assets/MiBandeja-CHaGvuaE.js', revision: null },
        { url: 'assets/logUpload-B-1aiBOe.js', revision: null },
        { url: 'assets/Login-DteEd8dn.js', revision: null },
        { url: 'assets/LocationManager-CwbBdTw5.js', revision: null },
        { url: 'assets/Insumos-_NQnmO9E.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-D0C6QhLx.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BK_YzxK6.js', revision: null },
        { url: 'assets/iamService-BGbTrb4r.js', revision: null },
        { url: 'assets/HistorialNV-B1zuheXp.js', revision: null },
        { url: 'assets/Heatmap-DftLfbkM.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DZjyatqU.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-BnUmrZnG.js', revision: null },
        { url: 'assets/Entry-CNvCjOVV.js', revision: null },
        { url: 'assets/DispatchControl-NwEzpY05.js', revision: null },
        { url: 'assets/DataImport-Bz7MZ7JI.js', revision: null },
        { url: 'assets/dashData-DISTVcSO.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-Bw7qDu_Z.js', revision: null },
        { url: 'assets/CubingRegistry-JXlMu14E.js', revision: null },
        { url: 'assets/conteoService-CABxLj3B.js', revision: null },
        { url: 'assets/ConteoCiclico-DQ6gEJlL.js', revision: null },
        { url: 'assets/ConsultaNV-D6RgmPqE.js', revision: null },
        { url: 'assets/ConsultaGrupo-CPFsgTSL.js', revision: null },
        { url: 'assets/configService-BTeN0rrX.js', revision: null },
        { url: 'assets/comunasChile-B2yjIehy.js', revision: null },
        { url: 'assets/Cleanup-Cgg-lNeP.js', revision: null },
        { url: 'assets/ClasificacionProductos-D2_pdJQ0.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CbcnUWse.js', revision: null },
        { url: 'assets/calidadService-CxhWn2sX.js', revision: null },
        { url: 'assets/CalidadBadge-BQZpgTEH.js', revision: null },
        { url: 'assets/BodegasSoftland-BTkEw7WS.js', revision: null },
        { url: 'assets/BloqueDetalle-CeQF5FxO.js', revision: null },
        { url: 'assets/Batches-CAH3WQ72.js', revision: null },
        { url: 'assets/ApiKeys-BRLTn5HS.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-Bl85OhEL.js', revision: null },
        { url: 'assets/AdminMonitor-BNv6PuCu.js', revision: null },
        { url: 'assets/Addresses-oBPj3wfi.js', revision: null },
        { url: 'assets/AccionIntegracion-Czs_noPC.js', revision: null },
        { url: 'assets/AccionesCalidad-BZJcMYN5.js', revision: null },
        { url: 'assets/AccessControl-DrnK3izc.js', revision: null },
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
