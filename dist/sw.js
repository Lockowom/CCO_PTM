if (!self.define) {
  let s,
    e = {};
  const l = (l, i) => (
    (l = new URL(l + '.js', i).href),
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
  self.define = (i, n) => {
    const r = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[r]) return;
    let u = {};
    const a = (s) => l(s, r),
      o = { module: { uri: r }, exports: u, require: a };
    e[r] = Promise.all(i.map((s) => o[s] || a(s))).then((s) => (n(...s), u));
  };
}
define(['./workbox-38ae441a'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '0439f56212e4ed1ef25e789f98632a80' },
        { url: 'assets/Workflows-B96x9qrD.js', revision: null },
        { url: 'assets/WmsLocations-BfUcGD8n.js', revision: null },
        { url: 'assets/web-D4EqSsN6.js', revision: null },
        { url: 'assets/web-Cy3bDuTv.js', revision: null },
        { url: 'assets/web-Cay-xRQD.js', revision: null },
        { url: 'assets/warehouseStore-BgKHzeCi.js', revision: null },
        { url: 'assets/WarehousePDA-BhoKUYSj.js', revision: null },
        { url: 'assets/Views-BWrIqBjC.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-FyBWIvpw.js', revision: null },
        { url: 'assets/useRealtimeTable-QT020foQ.js', revision: null },
        { url: 'assets/useBarcodeScanner-D4jdgJao.js', revision: null },
        { url: 'assets/UploadHistory-BpogA5CE.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-CQyz0kUP.js', revision: null },
        { url: 'assets/Traspasos-vn-XwM2O.js', revision: null },
        { url: 'assets/Transporte-CSX9k9hY.js', revision: null },
        { url: 'assets/Tickets-CmrVW8Qa.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-DgfUtFxk.js', revision: null },
        { url: 'assets/SolicitudPublica-Cx67d06E.js', revision: null },
        { url: 'assets/Seguridad-ugAD_hqG.js', revision: null },
        { url: 'assets/securityService-DkEsofVD.js', revision: null },
        { url: 'assets/SalesStatus-CY2YbpEl.js', revision: null },
        { url: 'assets/ReceptionNacional-BwqndnDp.js', revision: null },
        { url: 'assets/Reception-CE0wo-Yi.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-Cg6Aw4kS.js', revision: null },
        { url: 'assets/Postventa-BCSZNj6e.js', revision: null },
        { url: 'assets/PodCapture-ZjdCRGf-.js', revision: null },
        { url: 'assets/pickingStore-QCfvlyZn.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-C5kF_XU5.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-C4pMsdeu.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-C86aVqGU.js', revision: null },
        { url: 'assets/MiRuta-DR71uw2C.js', revision: null },
        { url: 'assets/MiBandeja-BOEthd4p.js', revision: null },
        { url: 'assets/logUpload-DgZOIOYw.js', revision: null },
        { url: 'assets/Login-Cao0_QUB.js', revision: null },
        { url: 'assets/LocationManager-By4xLMNE.js', revision: null },
        { url: 'assets/Insumos-zD3QFKmB.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-D7Ti5GnI.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BncYchmL.js', revision: null },
        { url: 'assets/iamService-BeUxU3lK.js', revision: null },
        { url: 'assets/HistorialNV-CD4E1K9l.js', revision: null },
        { url: 'assets/Heatmap-CODPNeGl.js', revision: null },
        { url: 'assets/FlujoMaestro-ChOwUafr.js', revision: null },
        { url: 'assets/Eventos-CTbWgR8p.js', revision: null },
        { url: 'assets/Entry-BqnLrbf8.js', revision: null },
        { url: 'assets/DispatchControl-CxkM98wD.js', revision: null },
        { url: 'assets/DataImport-D9ZhIVZZ.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CgrAEhf_.js', revision: null },
        { url: 'assets/CubingRegistry-CWCyO2UB.js', revision: null },
        { url: 'assets/conteoService-BzhR-XRI.js', revision: null },
        { url: 'assets/ConteoCiclico-D9zJ_a33.js', revision: null },
        { url: 'assets/ConsultaNV-CP3gz0td.js', revision: null },
        { url: 'assets/ConsultaGrupo-BSuzyWmD.js', revision: null },
        { url: 'assets/comunasChile-ClmQB2XS.js', revision: null },
        { url: 'assets/Cleanup-BBiPQVGw.js', revision: null },
        { url: 'assets/ClasificacionProductos-CkuK87Vf.js', revision: null },
        { url: 'assets/Carteles-DwP5iWkk.js', revision: null },
        { url: 'assets/calidadService-BVdHcjQk.js', revision: null },
        { url: 'assets/CalidadBadge-D8zPjIxv.js', revision: null },
        { url: 'assets/BodegasSoftland-IPYQ8gyy.js', revision: null },
        { url: 'assets/BloqueDetalle-CR213MnJ.js', revision: null },
        { url: 'assets/Batches-B_QIZytY.js', revision: null },
        { url: 'assets/ApiKeys-CUC_BBuK.js', revision: null },
        { url: 'assets/AnalisisCodigos-C9Pwn8sU.js', revision: null },
        { url: 'assets/AdminMonitor-FOaG_7XE.js', revision: null },
        { url: 'assets/Addresses-qrGYgtcg.js', revision: null },
        { url: 'assets/AccionIntegracion-CmQxqJIq.js', revision: null },
        { url: 'assets/AccionesCalidad-fk7OVQim.js', revision: null },
        { url: 'assets/AccessControl-BHS3eN_a.js', revision: null },
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
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
          new s.BackgroundSyncPlugin('supabase-background-sync', { maxRetentionTime: 1440 })
        ]
      }),
      'GET'
    ));
});
