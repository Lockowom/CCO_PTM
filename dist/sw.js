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
        { url: 'index.html', revision: '9f4c8d7c3cc93742ee860a7ae6e16370' },
        { url: 'assets/Workflows-D7IbMQHP.js', revision: null },
        { url: 'assets/WmsLocations-CRyizHUk.js', revision: null },
        { url: 'assets/web-Uqiwa1s4.js', revision: null },
        { url: 'assets/web-Dv49ohQ7.js', revision: null },
        { url: 'assets/web-C3hwBW2c.js', revision: null },
        { url: 'assets/warehouseStore-DrcgO15g.js', revision: null },
        { url: 'assets/WarehousePDA-CjJ1zFXG.js', revision: null },
        { url: 'assets/Views-CEUwz8b2.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-DUm_Xcow.js', revision: null },
        { url: 'assets/useRealtimeTable-CSjP-mJ-.js', revision: null },
        { url: 'assets/useBarcodeScanner-DJQhL0xu.js', revision: null },
        { url: 'assets/UploadHistory-DhMzECdn.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-CMaqdqsN.js', revision: null },
        { url: 'assets/Traspasos-CKYssmDK.js', revision: null },
        { url: 'assets/Transporte-BUbBgsDa.js', revision: null },
        { url: 'assets/Tickets-qN7hvrbS.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-DaBsNHQ0.js', revision: null },
        { url: 'assets/SolicitudPublica-B4ZlebhR.js', revision: null },
        { url: 'assets/Seguridad-DSB9JufY.js', revision: null },
        { url: 'assets/securityService-DZRtBT_J.js', revision: null },
        { url: 'assets/SalesStatus-BcKfvJgv.js', revision: null },
        { url: 'assets/ReceptionNacional-K10MtaFb.js', revision: null },
        { url: 'assets/Reception-D3QoTkzL.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-BljxVeXZ.js', revision: null },
        { url: 'assets/Postventa-CPZnV--M.js', revision: null },
        { url: 'assets/PodCapture-DCqMcFUY.js', revision: null },
        { url: 'assets/pickingStore-DjzToaCy.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-COkuOrnS.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-B4zZmoO0.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-cvB47nzB.js', revision: null },
        { url: 'assets/MiRuta-yx5Wg2QI.js', revision: null },
        { url: 'assets/MiBandeja-tFRQayZ-.js', revision: null },
        { url: 'assets/logUpload-BscdDAKp.js', revision: null },
        { url: 'assets/Login-D_auPsaR.js', revision: null },
        { url: 'assets/LocationManager-DWvo52Yj.js', revision: null },
        { url: 'assets/Insumos-BYi1z6eg.js', revision: null },
        { url: 'assets/index-e6bbcg0S.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BtXnTIfb.js', revision: null },
        { url: 'assets/iamService-BWO8_ftK.js', revision: null },
        { url: 'assets/HistorialNV-BHLtIzrw.js', revision: null },
        { url: 'assets/Heatmap-BotuI7dx.js', revision: null },
        { url: 'assets/FlujoMaestro-DhDRAGRc.js', revision: null },
        { url: 'assets/Eventos-CLzmHP_P.js', revision: null },
        { url: 'assets/Entry-CjL8RkOh.js', revision: null },
        { url: 'assets/DispatchControl-Bi5YcCV1.js', revision: null },
        { url: 'assets/DataImport-ugQwjJtT.js', revision: null },
        { url: 'assets/DashboardReal-DzoIpHj_.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-3zdjQaoW.js', revision: null },
        { url: 'assets/conteoService-DeOgxs_Q.js', revision: null },
        { url: 'assets/ConteoCiclico-BfzsLeDk.js', revision: null },
        { url: 'assets/ConsultaNV-zBcEJAgd.js', revision: null },
        { url: 'assets/ConsultaGrupo-BALh7AHP.js', revision: null },
        { url: 'assets/comunasChile-B9lpMTn1.js', revision: null },
        { url: 'assets/Cleanup-YrlEX0dI.js', revision: null },
        { url: 'assets/ClasificacionProductos-BCv2iPHF.js', revision: null },
        { url: 'assets/Carteles-CrWmak25.js', revision: null },
        { url: 'assets/calidadService-D-WWxbFS.js', revision: null },
        { url: 'assets/CalidadBadge-BcbpudZq.js', revision: null },
        { url: 'assets/BodegasSoftland-CvkFQit0.js', revision: null },
        { url: 'assets/BloqueDetalle-DXKPRMes.js', revision: null },
        { url: 'assets/Batches-I-eRV28W.js', revision: null },
        { url: 'assets/ApiKeys-DLVjtHmS.js', revision: null },
        { url: 'assets/AnalisisCodigos-Pf0DjpiO.js', revision: null },
        { url: 'assets/AdminMonitor-BIvZMQ_S.js', revision: null },
        { url: 'assets/Addresses-ryT4zQ8N.js', revision: null },
        { url: 'assets/AccionIntegracion-D32sWB1s.js', revision: null },
        { url: 'assets/AccionesCalidad-CpWm1bhH.js', revision: null },
        { url: 'assets/AccessControl-3Etpjymy.js', revision: null },
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
