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
        { url: 'index.html', revision: '1f55e14390efc1d43e0f44c20a1b2095' },
        { url: 'assets/Workflows-HSV_EHhx.js', revision: null },
        { url: 'assets/WmsLocations-CLyPjq1O.js', revision: null },
        { url: 'assets/web-DSIVHTrT.js', revision: null },
        { url: 'assets/web-D-e-20Ud.js', revision: null },
        { url: 'assets/web-CiKxTN0y.js', revision: null },
        { url: 'assets/warehouseStore-C_nfsIrK.js', revision: null },
        { url: 'assets/WarehousePDA-X9QjY9NM.js', revision: null },
        { url: 'assets/Views-KAgPqxRQ.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-CdC36p1c.js', revision: null },
        { url: 'assets/useRealtimeTable-17SA_--b.js', revision: null },
        { url: 'assets/useBarcodeScanner-DEFxQwjF.js', revision: null },
        { url: 'assets/UploadHistory-CMV2DV0c.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-DJ6zumWM.js', revision: null },
        { url: 'assets/Traspasos-th2VpjFB.js', revision: null },
        { url: 'assets/Transporte-BvrVGpDd.js', revision: null },
        { url: 'assets/Tickets-aFSkf_d1.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-Dk8gu-2t.js', revision: null },
        { url: 'assets/SolicitudPublica-8b1RXCM4.js', revision: null },
        { url: 'assets/Seguridad-CaFWqUmw.js', revision: null },
        { url: 'assets/securityService-CRY44XNA.js', revision: null },
        { url: 'assets/SalesStatus-DLlPRIq7.js', revision: null },
        { url: 'assets/ReceptionNacional-D9hy7KBd.js', revision: null },
        { url: 'assets/Reception-BPPir1sP.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-DcffxrSu.js', revision: null },
        { url: 'assets/Postventa-DF3NbUwf.js', revision: null },
        { url: 'assets/PodCapture-aXzLM8JI.js', revision: null },
        { url: 'assets/pickingStore-fLiZ5bgs.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-Btjbre7_.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-DghX2C8_.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-GyRlH7Hi.js', revision: null },
        { url: 'assets/MiRuta-gP7_1fLd.js', revision: null },
        { url: 'assets/MiBandeja-B0P6C1dV.js', revision: null },
        { url: 'assets/logUpload-BciiBP4E.js', revision: null },
        { url: 'assets/Login-C2TS-G_T.js', revision: null },
        { url: 'assets/LocationManager-CVz5waB3.js', revision: null },
        { url: 'assets/Insumos-BMaLRgi4.js', revision: null },
        { url: 'assets/index-DeUqOtXH.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-C11uFGei.js', revision: null },
        { url: 'assets/iamService-Qqwxvmfl.js', revision: null },
        { url: 'assets/HistorialNV-CbvOdkVS.js', revision: null },
        { url: 'assets/Heatmap-AVP7hF1o.js', revision: null },
        { url: 'assets/FlujoMaestro-CdntvugG.js', revision: null },
        { url: 'assets/Eventos-CYPe1u9k.js', revision: null },
        { url: 'assets/Entry-CJD-Cf5p.js', revision: null },
        { url: 'assets/DispatchControl-BkFWtcsB.js', revision: null },
        { url: 'assets/DataImport-BfHlN2hy.js', revision: null },
        { url: 'assets/DashboardReal-VExnQOtc.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-XN5oMS0v.js', revision: null },
        { url: 'assets/conteoService-BJGG-QU_.js', revision: null },
        { url: 'assets/ConteoCiclico-CuOc6K8w.js', revision: null },
        { url: 'assets/ConsultaNV-Gb2LMcRk.js', revision: null },
        { url: 'assets/ConsultaGrupo-T5ZLibI7.js', revision: null },
        { url: 'assets/comunasChile-BObedCe8.js', revision: null },
        { url: 'assets/Cleanup-D9ntF-DX.js', revision: null },
        { url: 'assets/ClasificacionProductos-0wa53TKg.js', revision: null },
        { url: 'assets/Carteles-DWZxMoH7.js', revision: null },
        { url: 'assets/calidadService-u-D_cre_.js', revision: null },
        { url: 'assets/CalidadBadge-D2aBJ01o.js', revision: null },
        { url: 'assets/BodegasSoftland-W7haDtNv.js', revision: null },
        { url: 'assets/BloqueDetalle-BtfPOKrb.js', revision: null },
        { url: 'assets/Batches-DwUyA8_x.js', revision: null },
        { url: 'assets/ApiKeys-BC21P1oe.js', revision: null },
        { url: 'assets/AnalisisCodigos-2xubRkhb.js', revision: null },
        { url: 'assets/AdminMonitor-Bk3yT_Ed.js', revision: null },
        { url: 'assets/Addresses-DhqvMngW.js', revision: null },
        { url: 'assets/AccionIntegracion-5ntxnKC_.js', revision: null },
        { url: 'assets/AccionesCalidad-D7OzVcXK.js', revision: null },
        { url: 'assets/AccessControl-C5nBSwF9.js', revision: null },
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
