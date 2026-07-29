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
        { url: 'index.html', revision: '8319bf8aea89da104a16cde709bcb24e' },
        { url: 'assets/Workflows-CxIgoVg0.js', revision: null },
        { url: 'assets/WmsLocations-DquLpID3.js', revision: null },
        { url: 'assets/web-CgWvAjUj.js', revision: null },
        { url: 'assets/web-BGBOlhvv.js', revision: null },
        { url: 'assets/web-BCpBMZO0.js', revision: null },
        { url: 'assets/warehouseStore-4zaQrDZ7.js', revision: null },
        { url: 'assets/WarehousePDA-B4zX_l9f.js', revision: null },
        { url: 'assets/Views-9eDH6H0Q.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-Bb3z14Hj.js', revision: null },
        { url: 'assets/useRealtimeTable-DdD_5fkL.js', revision: null },
        { url: 'assets/useBarcodeScanner-Yny2GlXZ.js', revision: null },
        { url: 'assets/UploadHistory-CNaWl5rP.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-BGsIrMwz.js', revision: null },
        { url: 'assets/Traspasos-DzTnnMbi.js', revision: null },
        { url: 'assets/Transporte-B8pPnTx0.js', revision: null },
        { url: 'assets/Tickets-H7v1sH1t.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-Bh9tg4RK.js', revision: null },
        { url: 'assets/SolicitudPublica-B7ILzF0N.js', revision: null },
        { url: 'assets/Seguridad-DBQmtWDQ.js', revision: null },
        { url: 'assets/securityService-LsWugjZG.js', revision: null },
        { url: 'assets/SalesStatus-CTHNLoTf.js', revision: null },
        { url: 'assets/ReceptionNacional-D1rHW1k8.js', revision: null },
        { url: 'assets/Reception-dnkjiFxZ.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-B7lJgokI.js', revision: null },
        { url: 'assets/Postventa-sWe1Zfga.js', revision: null },
        { url: 'assets/PodCapture-1dEQ-M-n.js', revision: null },
        { url: 'assets/pickingStore-bYbIAR6c.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-BRqmcP5x.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-BcIDmSdi.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-Bv-yqjVL.js', revision: null },
        { url: 'assets/MiRuta-7remk8k6.js', revision: null },
        { url: 'assets/MiBandeja-C2UjnqQH.js', revision: null },
        { url: 'assets/logUpload-QWbuDcYI.js', revision: null },
        { url: 'assets/Login-BJh949zS.js', revision: null },
        { url: 'assets/LocationManager-CBajaeZ-.js', revision: null },
        { url: 'assets/Insumos-BnxLdRKn.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-CyreZcpi.js', revision: null },
        { url: 'assets/index-CNV3XiUt.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/iamService-BGiGqUAt.js', revision: null },
        { url: 'assets/HistorialNV-OlxGkZP_.js', revision: null },
        { url: 'assets/Heatmap-BtupZgW0.js', revision: null },
        { url: 'assets/FlujoMaestro-CCyqbdRP.js', revision: null },
        { url: 'assets/Eventos-B78ocU_H.js', revision: null },
        { url: 'assets/Entry-BcIyzPHz.js', revision: null },
        { url: 'assets/DispatchControl-CBdalHjX.js', revision: null },
        { url: 'assets/DataImport-DI67gV6L.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BQ8AegDB.js', revision: null },
        { url: 'assets/CubingRegistry-D5UCkWUO.js', revision: null },
        { url: 'assets/conteoService-DHGXm0fm.js', revision: null },
        { url: 'assets/ConteoCiclico-tqbW2VQ3.js', revision: null },
        { url: 'assets/ConsultaNV-B3wyGRlW.js', revision: null },
        { url: 'assets/ConsultaGrupo-Fsho5ZOl.js', revision: null },
        { url: 'assets/comunasChile-DWcu8w-d.js', revision: null },
        { url: 'assets/Cleanup-Bwdzbh4U.js', revision: null },
        { url: 'assets/ClasificacionProductos-DGZIEhMf.js', revision: null },
        { url: 'assets/Carteles-C2bHxZDd.js', revision: null },
        { url: 'assets/calidadService-DZa_EFDu.js', revision: null },
        { url: 'assets/CalidadBadge-Cz9BxEKY.js', revision: null },
        { url: 'assets/BodegasSoftland-KTAFCs2R.js', revision: null },
        { url: 'assets/BloqueDetalle-6iH5wnw2.js', revision: null },
        { url: 'assets/Batches-DvX_KtJs.js', revision: null },
        { url: 'assets/ApiKeys-BCnt7wB9.js', revision: null },
        { url: 'assets/AnalisisCodigos-BH-xIdAP.js', revision: null },
        { url: 'assets/AdminMonitor-BCZsTQMw.js', revision: null },
        { url: 'assets/Addresses-C76linQo.js', revision: null },
        { url: 'assets/AccionIntegracion-CTNRY8TU.js', revision: null },
        { url: 'assets/AccionesCalidad-D6d4UUeG.js', revision: null },
        { url: 'assets/AccessControl-Dvui2FD9.js', revision: null },
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
