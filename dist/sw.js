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
        { url: 'index.html', revision: 'c0931920b1f9e40770a79f0fb903a527' },
        { url: 'assets/web-DxX4K1Bp.js', revision: null },
        { url: 'assets/web-DvlHrpJ3.js', revision: null },
        { url: 'assets/web-DOHbFyRu.js', revision: null },
        { url: 'assets/warehouseStore-DstI3iit.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/useRealtimeTable-fQnvFZ_V.js', revision: null },
        { url: 'assets/useBarcodeScanner-B1dC6Kg4.js', revision: null },
        { url: 'assets/ui-vendor-BlA2_0Vt.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-zanyKMhD.js', revision: null },
        { url: 'assets/securityService-C3WEUZMI.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/pickingStore-Croa7n-v.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-C6oIEvzH.js', revision: null },
        { url: 'assets/logUpload-C1cCtK8V.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BU_ov3s4.js', revision: null },
        { url: 'assets/index-5R6IKZpF.js', revision: null },
        { url: 'assets/iamService-Cu-kfHP4.js', revision: null },
        { url: 'assets/conteoService-cRpQuDBZ.js', revision: null },
        { url: 'assets/comunasChile-Bc-JMCJm.js', revision: null },
        { url: 'assets/calidadService-BeNfhSZv.js', revision: null },
        { url: 'assets/Workflows-CfBHT88R.js', revision: null },
        { url: 'assets/WmsLocations-BYK5dHrS.js', revision: null },
        { url: 'assets/WarehousePDA-BpQsSb-A.js', revision: null },
        { url: 'assets/Views-SxIdzUrn.js', revision: null },
        { url: 'assets/VerificarCertificado-B0-WAyhj.js', revision: null },
        { url: 'assets/UploadHistory-B5gKi76n.js', revision: null },
        { url: 'assets/TrazabilidadModal-Dh1ZNbDi.js', revision: null },
        { url: 'assets/Traspasos-D9Oa8UB-.js', revision: null },
        { url: 'assets/Transporte-CyaFedKN.js', revision: null },
        { url: 'assets/Tickets-BdSv9S9A.js', revision: null },
        { url: 'assets/SolicitudPublica-CEH0Gpo3.js', revision: null },
        { url: 'assets/Seguridad-BricK7bD.js', revision: null },
        { url: 'assets/SalesStatus-C50ZXoOt.js', revision: null },
        { url: 'assets/ReceptionNacional-BVVvf6bf.js', revision: null },
        { url: 'assets/Reception-CupLw7fF.js', revision: null },
        { url: 'assets/QueryErrorState-DNrU4WXZ.js', revision: null },
        { url: 'assets/ProductDatasheet-CgU3Xliq.js', revision: null },
        { url: 'assets/Postventa-C1SNwalR.js', revision: null },
        { url: 'assets/PodCapture-BY8QbqEt.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BU7m1PK0.js', revision: null },
        { url: 'assets/Observability-BhOS1aJU.js', revision: null },
        { url: 'assets/NotFound-Dm_8xAIB.js', revision: null },
        { url: 'assets/Monitoreo-C20VZTAP.js', revision: null },
        { url: 'assets/MiRuta-DFsvYUk5.js', revision: null },
        { url: 'assets/MiBandeja-Cxzp0Eqr.js', revision: null },
        { url: 'assets/Login-Bnsw5vWz.js', revision: null },
        { url: 'assets/LocationManager-C-N6lREQ.js', revision: null },
        { url: 'assets/Insumos-B1nPQ3G5.js', revision: null },
        { url: 'assets/HistorialNV-DRRXHCi_.js', revision: null },
        { url: 'assets/Heatmap-C1YNGnDh.js', revision: null },
        { url: 'assets/FlujoMaestro-DsXznuWw.js', revision: null },
        { url: 'assets/Eventos-BcsFOtJz.js', revision: null },
        { url: 'assets/Entry-CLcWpGqN.js', revision: null },
        { url: 'assets/DispatchControl-X9T04pv4.js', revision: null },
        { url: 'assets/DataImport-BSGZkcyA.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BRIQ51uR.js', revision: null },
        { url: 'assets/CubingRegistry-Dg7tdcmM.js', revision: null },
        { url: 'assets/ConteoCiclico-BvaF2pzu.js', revision: null },
        { url: 'assets/ConsultaNV-Dxe18Ooz.js', revision: null },
        { url: 'assets/ConsultaGrupo-Da8m_0Q_.js', revision: null },
        { url: 'assets/Cleanup-VM-vtaoX.js', revision: null },
        { url: 'assets/ClasificacionProductos-HCTVE9Tz.js', revision: null },
        { url: 'assets/Carteles-CUcOjjp-.js', revision: null },
        { url: 'assets/CalidadBadge-BrFyTfUS.js', revision: null },
        { url: 'assets/BodegasSoftland-CN1TzGQ-.js', revision: null },
        { url: 'assets/BloqueDetalle-ejj50Z-b.js', revision: null },
        { url: 'assets/Batches-3qbvPWyB.js', revision: null },
        { url: 'assets/ApiKeys-G8i7LkVh.js', revision: null },
        { url: 'assets/AnalisisCodigos-CxKI-_mS.js', revision: null },
        { url: 'assets/AdminMonitor-BgxEfSfJ.js', revision: null },
        { url: 'assets/Addresses-CiuYwWeg.js', revision: null },
        { url: 'assets/AccionesCalidad-DRKwIggH.js', revision: null },
        { url: 'assets/AccionIntegracion-BBYK9khC.js', revision: null },
        { url: 'assets/AccessControl-CGsVAslM.js', revision: null },
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
