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
        { url: 'index.html', revision: '97c07b2bce1d98c9152924a294a7c870' },
        { url: 'assets/Workflows-2E531_LT.js', revision: null },
        { url: 'assets/WmsLocations-B8VO6mXO.js', revision: null },
        { url: 'assets/web-RDu_prLo.js', revision: null },
        { url: 'assets/web-CUz5IwiX.js', revision: null },
        { url: 'assets/web-BKLXMkb4.js', revision: null },
        { url: 'assets/warehouseStore-B4JKNeWb.js', revision: null },
        { url: 'assets/WarehousePDA-7jdaAO--.js', revision: null },
        { url: 'assets/Views-CZfz0sFz.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-DOD2Go9L.js', revision: null },
        { url: 'assets/useRealtimeTable-1pAFwq65.js', revision: null },
        { url: 'assets/useBarcodeScanner-DPB-VY6W.js', revision: null },
        { url: 'assets/UploadHistory-DjUN48yE.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-DZixEIm6.js', revision: null },
        { url: 'assets/Traspasos-BxECk-RN.js', revision: null },
        { url: 'assets/Transporte-CnAQuHdA.js', revision: null },
        { url: 'assets/Tickets-Nr6FzBKx.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-BoM5mYSt.js', revision: null },
        { url: 'assets/SolicitudPublica-YFLD8xQ0.js', revision: null },
        { url: 'assets/Seguridad-Dx0RI1Sx.js', revision: null },
        { url: 'assets/securityService-C-Fc-eTD.js', revision: null },
        { url: 'assets/SalesStatus-Dtgj0eyw.js', revision: null },
        { url: 'assets/ReceptionNacional-DT3ZTBZ1.js', revision: null },
        { url: 'assets/Reception-C6Frvc9l.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-CPSXsEKg.js', revision: null },
        { url: 'assets/Postventa-zzgcXF5V.js', revision: null },
        { url: 'assets/PodCapture-CGQNI7if.js', revision: null },
        { url: 'assets/pickingStore-C8z4VQ_J.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-BBAcRJuB.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-DePu0u1e.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-DOIIY9xs.js', revision: null },
        { url: 'assets/MiRuta-sWvDEM1T.js', revision: null },
        { url: 'assets/MiBandeja-CoKIPa_O.js', revision: null },
        { url: 'assets/logUpload-CyOAIliw.js', revision: null },
        { url: 'assets/Login-Bv3OK9wQ.js', revision: null },
        { url: 'assets/LocationManager-CDqCkOu-.js', revision: null },
        { url: 'assets/Insumos-BI5SV2de.js', revision: null },
        { url: 'assets/index-FL3Y6hBi.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-CMd8_LWN.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/iamService-CRibdE6t.js', revision: null },
        { url: 'assets/HistorialNV-ZfC5C-mB.js', revision: null },
        { url: 'assets/Heatmap-BYgkd9OX.js', revision: null },
        { url: 'assets/FlujoMaestro-CdQUcrav.js', revision: null },
        { url: 'assets/Eventos-DvFdlXS6.js', revision: null },
        { url: 'assets/Entry-DM79ytj0.js', revision: null },
        { url: 'assets/DispatchControl-DFFjBvfg.js', revision: null },
        { url: 'assets/DataImport-Cm-1mwjN.js', revision: null },
        { url: 'assets/DashboardReal-mBxE4C92.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-BUZUC2PA.js', revision: null },
        { url: 'assets/conteoService-Dj72KyR3.js', revision: null },
        { url: 'assets/ConteoCiclico-Y6ex1t_F.js', revision: null },
        { url: 'assets/ConsultaNV-CxU-EiUm.js', revision: null },
        { url: 'assets/ConsultaGrupo-wuCibefj.js', revision: null },
        { url: 'assets/comunasChile-BxTLHsM4.js', revision: null },
        { url: 'assets/Cleanup-DrXbYQtF.js', revision: null },
        { url: 'assets/ClasificacionProductos-DyYyucjA.js', revision: null },
        { url: 'assets/Carteles-DJnhDADj.js', revision: null },
        { url: 'assets/calidadService-CcaE66Wh.js', revision: null },
        { url: 'assets/CalidadBadge-BFz1n01t.js', revision: null },
        { url: 'assets/BodegasSoftland-BpIl2USk.js', revision: null },
        { url: 'assets/BloqueDetalle-DjiKcZbA.js', revision: null },
        { url: 'assets/Batches-6_8A5xYt.js', revision: null },
        { url: 'assets/ApiKeys-CXMRyboK.js', revision: null },
        { url: 'assets/AnalisisCodigos-AwT9FJqa.js', revision: null },
        { url: 'assets/AdminMonitor-DXPTZW9C.js', revision: null },
        { url: 'assets/Addresses-C5p6RLNd.js', revision: null },
        { url: 'assets/AccionIntegracion-_PBrjziA.js', revision: null },
        { url: 'assets/AccionesCalidad-CCiYvyjU.js', revision: null },
        { url: 'assets/AccessControl-BlsONONK.js', revision: null },
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
