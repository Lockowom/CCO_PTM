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
define(['./workbox-38ae441a'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: 'e70ac10e77240425ca162883df22955b' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BQA6lMj3.js', revision: null },
        { url: 'assets/WmsLocations-BoSxZQE9.js', revision: null },
        { url: 'assets/web-DgmhwjsH.js', revision: null },
        { url: 'assets/web-Dftj9yMU.js', revision: null },
        { url: 'assets/web-C6pX-Frs.js', revision: null },
        { url: 'assets/warehouseStore-CpLaDGap.js', revision: null },
        { url: 'assets/WarehousePDA-BJszz0g5.js', revision: null },
        { url: 'assets/Views-Cq7ZkHbP.js', revision: null },
        { url: 'assets/vfs_fonts-C24r0ruI.js', revision: null },
        { url: 'assets/VerificarCertificado-CYWznnNE.js', revision: null },
        { url: 'assets/useRealtimeTable-1ulJEdNk.js', revision: null },
        { url: 'assets/useBarcodeScanner-DxWQig71.js', revision: null },
        { url: 'assets/UploadHistory-BVFxWUyn.js', revision: null },
        { url: 'assets/ui-vendor-D-9zQVt7.js', revision: null },
        { url: 'assets/TrazabilidadModal-f9nGk-Oi.js', revision: null },
        { url: 'assets/Traspasos-DAfehS02.js', revision: null },
        { url: 'assets/Transporte-ah4W5WeV.js', revision: null },
        { url: 'assets/Tickets-DApL6n4h.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-CvSuNsDI.js', revision: null },
        { url: 'assets/SolicitudPublica-DOgkw_Bz.js', revision: null },
        { url: 'assets/Seguridad-CE8r2AK8.js', revision: null },
        { url: 'assets/securityService-CiVRfOJ4.js', revision: null },
        { url: 'assets/SalesStatus-GQB7JqvB.js', revision: null },
        { url: 'assets/ReceptionNacional-nTwLawEd.js', revision: null },
        { url: 'assets/Reception-CBzdvhVr.js', revision: null },
        { url: 'assets/react-vendor-C8fdn38R.js', revision: null },
        { url: 'assets/QueryErrorState-Ca2nvJNI.js', revision: null },
        { url: 'assets/query-vendor-B1MP_4YJ.js', revision: null },
        { url: 'assets/ProductDatasheet-X2C-BT9I.js', revision: null },
        { url: 'assets/Postventa-BDQFk3Oc.js', revision: null },
        { url: 'assets/PodCapture-CnsYi2yX.js', revision: null },
        { url: 'assets/pickingStore-B6NG5l76.js', revision: null },
        { url: 'assets/pdfmake-BwwREtpy.js', revision: null },
        { url: 'assets/PanelTVReal-NcQ6iMYU.js', revision: null },
        { url: 'assets/panelPtm-B3vGQQTW.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BrWHiqAA.js', revision: null },
        { url: 'assets/PanelIngresar-CZDHSSfo.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-DgUS7725.js', revision: null },
        { url: 'assets/PanelConfigReal-DP0cjLm5.js', revision: null },
        { url: 'assets/PanelBuilderReal-D9MgYzmD.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-BtKK7Yjt.js', revision: null },
        { url: 'assets/NotFound-3sCqnTFJ.js', revision: null },
        { url: 'assets/Monitoreo-B1UncVj3.js', revision: null },
        { url: 'assets/MiRuta-CDx6biZm.js', revision: null },
        { url: 'assets/MiBandeja-CijAyhl4.js', revision: null },
        { url: 'assets/logUpload-UsLUOxNF.js', revision: null },
        { url: 'assets/Login-DoXNNvDG.js', revision: null },
        { url: 'assets/LocationManager-Ct1RFjX8.js', revision: null },
        { url: 'assets/Insumos-DyY5XVPD.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-Dil3U0Ub.js', revision: null },
        { url: 'assets/index-CXYp_lIK.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BY7aphY9.js', revision: null },
        { url: 'assets/iamService-C590RmEb.js', revision: null },
        { url: 'assets/HistorialNV-BCpx7twc.js', revision: null },
        { url: 'assets/Heatmap-V-fOPx5Z.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DilFYNyA.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-3ouBTQA0.js', revision: null },
        { url: 'assets/Entry-BgkPtBd8.js', revision: null },
        { url: 'assets/DispatchControl-C7X_63VN.js', revision: null },
        { url: 'assets/DataImport-L21j0SPI.js', revision: null },
        { url: 'assets/dashData-C-rKtxw7.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BVye6SP_.js', revision: null },
        { url: 'assets/CubingRegistry-DALUJZV4.js', revision: null },
        { url: 'assets/conteoService-DdMZcSk6.js', revision: null },
        { url: 'assets/ConteoCiclico-BDdlHZm2.js', revision: null },
        { url: 'assets/ConsultaNV-BKkOr9OO.js', revision: null },
        { url: 'assets/ConsultaGrupo-CPD_hYRD.js', revision: null },
        { url: 'assets/configService-CnUgHRm3.js', revision: null },
        { url: 'assets/comunasChile-CBiXkYsi.js', revision: null },
        { url: 'assets/Cleanup-DaUb777w.js', revision: null },
        { url: 'assets/ClasificacionProductos-Pw-FKnt0.js', revision: null },
        { url: 'assets/charts-vendor-BPHLCusR.js', revision: null },
        { url: 'assets/Carteles-BnJrhzNA.js', revision: null },
        { url: 'assets/calidadService-C9vUp0iK.js', revision: null },
        { url: 'assets/CalidadBadge-BeAQKsxf.js', revision: null },
        { url: 'assets/BodegasSoftland-bBVQYliE.js', revision: null },
        { url: 'assets/BloqueDetalle-D2gbwfCU.js', revision: null },
        { url: 'assets/Batches-Dbniznz6.js', revision: null },
        { url: 'assets/ApiKeys-Cc8fVXNU.js', revision: null },
        { url: 'assets/animation-vendor-BwUUObbT.js', revision: null },
        { url: 'assets/AnalisisCodigos-wLpWJOfY.js', revision: null },
        { url: 'assets/AdminMonitor-LxSLr2D7.js', revision: null },
        { url: 'assets/Addresses-Craq13En.js', revision: null },
        { url: 'assets/AccionIntegracion-2Vz2Fb4D.js', revision: null },
        { url: 'assets/AccionesCalidad-CzdI2QrG.js', revision: null },
        { url: 'assets/AccessControl-CNnxDmax.js', revision: null },
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
