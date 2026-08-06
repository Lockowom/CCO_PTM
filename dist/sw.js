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
define(['./workbox-8925e955'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: 'aa6d3dfc2227854bccb88deecd41abbc' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-B__raPru.js', revision: null },
        { url: 'assets/WmsLocations-zb0FtK8q.js', revision: null },
        { url: 'assets/web-CRReUV1k.js', revision: null },
        { url: 'assets/web-BiTuqJ9k.js', revision: null },
        { url: 'assets/web-B2Q4pB6f.js', revision: null },
        { url: 'assets/warehouseStore-BeLN9-q2.js', revision: null },
        { url: 'assets/WarehousePDA-BlCkMDKs.js', revision: null },
        { url: 'assets/Views-BjYWeJ7x.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-B3UPGHYO.js', revision: null },
        { url: 'assets/useRealtimeTable-D6Z6DHq-.js', revision: null },
        { url: 'assets/useBarcodeScanner-EwXBSjDO.js', revision: null },
        { url: 'assets/UploadHistory-Bbp50n7w.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-BItwfkC8.js', revision: null },
        { url: 'assets/Traspasos-DDev9E6G.js', revision: null },
        { url: 'assets/Transporte-C2TfqwdZ.js', revision: null },
        { url: 'assets/Tickets-CeHXHMqy.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BTxTlPqN.js', revision: null },
        { url: 'assets/SolicitudPublica-Byzi2Uc4.js', revision: null },
        { url: 'assets/Seguridad-Bosb25az.js', revision: null },
        { url: 'assets/securityService-z-izWSGw.js', revision: null },
        { url: 'assets/SalesStatus-B5Q1YJc0.js', revision: null },
        { url: 'assets/ReceptionNacional-B993ID9r.js', revision: null },
        { url: 'assets/Reception-DD352_xf.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-Iu9dwzaF.js', revision: null },
        { url: 'assets/Postventa-C7zalDUh.js', revision: null },
        { url: 'assets/PodCapture-CFamkULq.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CCgSy2_v.js', revision: null },
        { url: 'assets/panelPtm-BKjSVOZx.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BpPtB-DJ.js', revision: null },
        { url: 'assets/PanelInfoReal-DxBowG_G.js', revision: null },
        { url: 'assets/PanelConfigReal-DG3S09Og.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-Cavig2kf.js', revision: null },
        { url: 'assets/Observability-DBS6Mth3.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-5Wx4kkHx.js', revision: null },
        { url: 'assets/MiRuta-D5OjazWT.js', revision: null },
        { url: 'assets/MiBandeja-CIglI3Y1.js', revision: null },
        { url: 'assets/logUpload-EQrbK6jC.js', revision: null },
        { url: 'assets/Login-D2bffUuh.js', revision: null },
        { url: 'assets/LocationManager-Kzwp1Jba.js', revision: null },
        { url: 'assets/Insumos-DPEzQ3zt.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-DfzWWCPy.js', revision: null },
        { url: 'assets/index-CvnzWbLN.css', revision: null },
        { url: 'assets/index-CS-MuY3N.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-be1qNAZr.js', revision: null },
        { url: 'assets/HistorialNV-DrGKKZml.js', revision: null },
        { url: 'assets/Heatmap-BGvTqhji.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-_XXDAuYR.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-C71otx3P.js', revision: null },
        { url: 'assets/Entry-CqyAyzZX.js', revision: null },
        { url: 'assets/DispatchControl-CVgtqdPv.js', revision: null },
        { url: 'assets/DataImport-CwXpAhED.js', revision: null },
        { url: 'assets/dashData-DJPP2N_j.js', revision: null },
        { url: 'assets/DashboardReal-DNK7aFHB.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-Dr3EXfkF.js', revision: null },
        { url: 'assets/conteoService-Cvy1muE3.js', revision: null },
        { url: 'assets/ConteoCiclico-DMyuqelM.js', revision: null },
        { url: 'assets/ConsultaNV-DrngDHJf.js', revision: null },
        { url: 'assets/ConsultaGrupo-DfCFKdKK.js', revision: null },
        { url: 'assets/configService-DMbm4wY_.js', revision: null },
        { url: 'assets/comunasChile-SZBVsvwq.js', revision: null },
        { url: 'assets/Cleanup-D5tBzbx2.js', revision: null },
        { url: 'assets/ClasificacionProductos-DVvxF_GW.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DLejZ8Sc.js', revision: null },
        { url: 'assets/calidadService-v4ThqQAe.js', revision: null },
        { url: 'assets/CalidadBadge-BS9EcFjR.js', revision: null },
        { url: 'assets/BodegasSoftland-BydpCTec.js', revision: null },
        { url: 'assets/BloqueDetalle-DgSYAJHR.js', revision: null },
        { url: 'assets/Batches-BB8HNJuW.js', revision: null },
        { url: 'assets/ApiKeys-lauA26jk.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-C3mBaNO9.js', revision: null },
        { url: 'assets/AdminMonitor-DsD6YqU6.js', revision: null },
        { url: 'assets/Addresses-em0AIwbt.js', revision: null },
        { url: 'assets/AccionIntegracion-eDfVdmsE.js', revision: null },
        { url: 'assets/AccionesCalidad-DYU-rXCg.js', revision: null },
        { url: 'assets/AccessControl-jHxRjbUv.js', revision: null },
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
      /^https:\/\/.*\.supabase\.co\/rest\/v1\/app_runtime_control.*/i,
      new s.NetworkOnly(),
      'GET'
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
