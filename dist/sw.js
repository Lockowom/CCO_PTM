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
        { url: 'index.html', revision: '319cbbf0514ae53def3a0d3c6b702655' },
        { url: 'assets/Workflows-D2-vwtIs.js', revision: null },
        { url: 'assets/WmsLocations-BBCQNcqt.js', revision: null },
        { url: 'assets/web-DxSyk1pO.js', revision: null },
        { url: 'assets/web-Dw5faugx.js', revision: null },
        { url: 'assets/web-CcaQzrpk.js', revision: null },
        { url: 'assets/warehouseStore-CfvqF2TD.js', revision: null },
        { url: 'assets/WarehousePDA-fbtHKh9p.js', revision: null },
        { url: 'assets/Views-B1fNHQm9.js', revision: null },
        { url: 'assets/vfs_fonts-DmYgAkA4.js', revision: null },
        { url: 'assets/VerificarCertificado-wHQjD-Cy.js', revision: null },
        { url: 'assets/useRealtimeTable-DyyDuzgP.js', revision: null },
        { url: 'assets/useBarcodeScanner-CdHcw5UK.js', revision: null },
        { url: 'assets/UploadHistory-Cpdpb-UV.js', revision: null },
        { url: 'assets/ui-vendor-BlA2_0Vt.js', revision: null },
        { url: 'assets/TrazabilidadModal-DGAJdoDK.js', revision: null },
        { url: 'assets/Traspasos-CRaaE5m2.js', revision: null },
        { url: 'assets/Transporte-CyHB0QJP.js', revision: null },
        { url: 'assets/Tickets-Ce6lbo9C.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-BQEAULMr.js', revision: null },
        { url: 'assets/SolicitudPublica-zmehaNMu.js', revision: null },
        { url: 'assets/Seguridad-DGrQMC5X.js', revision: null },
        { url: 'assets/securityService-CxIOPIBM.js', revision: null },
        { url: 'assets/SalesStatus-DqaRrdcZ.js', revision: null },
        { url: 'assets/ReceptionNacional-ojcuyztA.js', revision: null },
        { url: 'assets/Reception-CQHdJq8r.js', revision: null },
        { url: 'assets/react-vendor-CA7EHQ1X.js', revision: null },
        { url: 'assets/QueryErrorState-DNrU4WXZ.js', revision: null },
        { url: 'assets/query-vendor-CojWQiBV.js', revision: null },
        { url: 'assets/ProductDatasheet-B0p6EweY.js', revision: null },
        { url: 'assets/Postventa-bVUnK3aS.js', revision: null },
        { url: 'assets/PodCapture-C2wVk_UA.js', revision: null },
        { url: 'assets/pickingStore-CuKqJw8T.js', revision: null },
        { url: 'assets/pdfmake-CbkR3qlH.js', revision: null },
        { url: 'assets/panelPtm-DrZEl_CF.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BU7m1PK0.js', revision: null },
        { url: 'assets/Observability-BbJAp0zC.js', revision: null },
        { url: 'assets/NotFound-Dm_8xAIB.js', revision: null },
        { url: 'assets/Monitoreo-0vVr079J.js', revision: null },
        { url: 'assets/MiRuta-BPawxaVh.js', revision: null },
        { url: 'assets/MiBandeja-DbYdBN8L.js', revision: null },
        { url: 'assets/logUpload-8hNdGiD4.js', revision: null },
        { url: 'assets/Login-DIXTFy4-.js', revision: null },
        { url: 'assets/LocationManager-D1z1t0eX.js', revision: null },
        { url: 'assets/Insumos-DJw9hW1K.js', revision: null },
        { url: 'assets/index-DEhSkj1b.css', revision: null },
        { url: 'assets/index-CXl7fTg4.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BHi_CJS5.js', revision: null },
        { url: 'assets/iamService-kbl6eYR3.js', revision: null },
        { url: 'assets/HistorialNV-DH_d3JSk.js', revision: null },
        { url: 'assets/Heatmap-CylRVPd9.js', revision: null },
        { url: 'assets/FlujoMaestro-BYL9taPl.js', revision: null },
        { url: 'assets/Eventos-QyMsmAEi.js', revision: null },
        { url: 'assets/Entry-C0x8wWtX.js', revision: null },
        { url: 'assets/DispatchControl-BioG79LD.js', revision: null },
        { url: 'assets/DataImport-D__FhLvo.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-28Ji7BCx.js', revision: null },
        { url: 'assets/CubingRegistry-Dqf5k0Qd.js', revision: null },
        { url: 'assets/conteoService-CHfBZLwI.js', revision: null },
        { url: 'assets/ConteoCiclico-B18v8ssq.js', revision: null },
        { url: 'assets/ConsultaNV-Cr8-y3tQ.js', revision: null },
        { url: 'assets/ConsultaGrupo-CULb1-1S.js', revision: null },
        { url: 'assets/comunasChile-CdjISFEz.js', revision: null },
        { url: 'assets/Cleanup-DYKnIPuf.js', revision: null },
        { url: 'assets/ClasificacionProductos-C9Fbqqnh.js', revision: null },
        { url: 'assets/Carteles-CfDfl1hk.js', revision: null },
        { url: 'assets/calidadService-Dmu7CNeU.js', revision: null },
        { url: 'assets/CalidadBadge-WT_094hA.js', revision: null },
        { url: 'assets/BodegasSoftland-CoKG850H.js', revision: null },
        { url: 'assets/BloqueDetalle-DwYaCeSm.js', revision: null },
        { url: 'assets/Batches-D4ZBpAlU.js', revision: null },
        { url: 'assets/ApiKeys-BsKa1PXM.js', revision: null },
        { url: 'assets/AnalisisCodigos-RwyCEQVe.js', revision: null },
        { url: 'assets/AdminMonitor-DqmWFoEe.js', revision: null },
        { url: 'assets/Addresses-BNTvW7xX.js', revision: null },
        { url: 'assets/AccionIntegracion-CtUQUIsk.js', revision: null },
        { url: 'assets/AccionesCalidad-ByMCiLQq.js', revision: null },
        { url: 'assets/AccessControl-Dm8Cl668.js', revision: null },
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
