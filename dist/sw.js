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
    const o = (s) => l(s, r),
      a = { module: { uri: r }, exports: u, require: o };
    e[r] = Promise.all(i.map((s) => a[s] || o(s))).then((s) => (n(...s), u));
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
        { url: 'index.html', revision: '814be984b4f14e0d9824775328257f3f' },
        { url: 'assets/Workflows-DUwYIt02.js', revision: null },
        { url: 'assets/WmsLocations-B1EJt81N.js', revision: null },
        { url: 'assets/web-e0TX67Vw.js', revision: null },
        { url: 'assets/web-CDevQsKZ.js', revision: null },
        { url: 'assets/web-BDG_45lz.js', revision: null },
        { url: 'assets/warehouseStore-Dekru-3B.js', revision: null },
        { url: 'assets/WarehousePDA-c2qpYx7N.js', revision: null },
        { url: 'assets/Views-CshkpMAJ.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-DAoQ05Wf.js', revision: null },
        { url: 'assets/useRealtimeTable-BnMWgbNH.js', revision: null },
        { url: 'assets/useBarcodeScanner-CqB84uJx.js', revision: null },
        { url: 'assets/UploadHistory-ClIz2HIp.js', revision: null },
        { url: 'assets/ui-vendor-C7KFTQPV.js', revision: null },
        { url: 'assets/TrazabilidadModal-Dhs8Mqro.js', revision: null },
        { url: 'assets/Traspasos-BYlwNv5P.js', revision: null },
        { url: 'assets/Transporte-BJB-UTnq.js', revision: null },
        { url: 'assets/Tickets-B1pg2XaO.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-BdIarsYw.js', revision: null },
        { url: 'assets/SolicitudPublica-CnbQwrA2.js', revision: null },
        { url: 'assets/Seguridad-DoAwt5Jl.js', revision: null },
        { url: 'assets/securityService-DQLBhjOt.js', revision: null },
        { url: 'assets/SalesStatus-O4hHSYQN.js', revision: null },
        { url: 'assets/ReceptionNacional-Bemlm24Z.js', revision: null },
        { url: 'assets/Reception-DQzC3mmn.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-XnOgzKAN.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-c_36D6nS.js', revision: null },
        { url: 'assets/Postventa-lx0pe9Mj.js', revision: null },
        { url: 'assets/PodCapture-kfYrtxFE.js', revision: null },
        { url: 'assets/pickingStore-Bsn40429.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-96BEbyrh.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-Brqjr3zd.js', revision: null },
        { url: 'assets/Observability-B2y8XuMI.js', revision: null },
        { url: 'assets/NotFound-DKrVuCGF.js', revision: null },
        { url: 'assets/Monitoreo-C87ob_oK.js', revision: null },
        { url: 'assets/MiRuta-CAEoEPC-.js', revision: null },
        { url: 'assets/MiBandeja-BHZULCcM.js', revision: null },
        { url: 'assets/logUpload-D6ZaMMJh.js', revision: null },
        { url: 'assets/Login-BQbrgHsf.js', revision: null },
        { url: 'assets/LocationManager---4cFEVC.js', revision: null },
        { url: 'assets/Insumos-DsJm9wHn.js', revision: null },
        { url: 'assets/index-DlPYBQFj.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-C8cxUZkP.js', revision: null },
        { url: 'assets/iamService-DQNYipUj.js', revision: null },
        { url: 'assets/HistorialNV-BAwvhoci.js', revision: null },
        { url: 'assets/Heatmap-CxQfURyZ.js', revision: null },
        { url: 'assets/FlujoMaestro-CDXYZe24.js', revision: null },
        { url: 'assets/Eventos-eUgp4D7v.js', revision: null },
        { url: 'assets/Entry-7dv7D93v.js', revision: null },
        { url: 'assets/DispatchControl-DciXx6xr.js', revision: null },
        { url: 'assets/DataImport-C5Oiu3bn.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-DBhcIfie.js', revision: null },
        { url: 'assets/CubingRegistry-NR8e_Sde.js', revision: null },
        { url: 'assets/conteoService--ogGdwAP.js', revision: null },
        { url: 'assets/ConteoCiclico-BfCuUWCi.js', revision: null },
        { url: 'assets/ConsultaNV-BDBmUaRS.js', revision: null },
        { url: 'assets/ConsultaGrupo-C8ObEyeo.js', revision: null },
        { url: 'assets/comunasChile-FIBrq_7z.js', revision: null },
        { url: 'assets/Cleanup-BL0VLimn.js', revision: null },
        { url: 'assets/ClasificacionProductos-DRy-ic6O.js', revision: null },
        { url: 'assets/Carteles-8cBCDS79.js', revision: null },
        { url: 'assets/calidadService-BUncM-7L.js', revision: null },
        { url: 'assets/CalidadBadge-DSBK2Avg.js', revision: null },
        { url: 'assets/BodegasSoftland-Bvc__aQW.js', revision: null },
        { url: 'assets/BloqueDetalle-BYb58P4m.js', revision: null },
        { url: 'assets/Batches-CtMkVsIE.js', revision: null },
        { url: 'assets/ApiKeys-CVVQqyh3.js', revision: null },
        { url: 'assets/AnalisisCodigos-E-Vl6-Ts.js', revision: null },
        { url: 'assets/AdminMonitor-DyJvNORx.js', revision: null },
        { url: 'assets/Addresses-CqZ5YtkF.js', revision: null },
        { url: 'assets/AccionIntegracion-DfvXmMKo.js', revision: null },
        { url: 'assets/AccionesCalidad-COvi8RNk.js', revision: null },
        { url: 'assets/AccessControl-OKDS72zg.js', revision: null },
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
