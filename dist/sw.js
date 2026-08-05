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
define(['./workbox-d8d3a357'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '4149c5deb6c3a66451c05d55a884e6ba' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-xh3d320i.js', revision: null },
        { url: 'assets/WmsLocations-Wb0DzXCE.js', revision: null },
        { url: 'assets/web-RlYU6dsu.js', revision: null },
        { url: 'assets/web-CeZDH9o1.js', revision: null },
        { url: 'assets/web-CamwCedc.js', revision: null },
        { url: 'assets/warehouseStore-BAOQ5j0r.js', revision: null },
        { url: 'assets/WarehousePDA-7zlr6ka4.js', revision: null },
        { url: 'assets/Views-CFamDv6P.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-C7NM6Mjf.js', revision: null },
        { url: 'assets/useRealtimeTable-C5dmFL6X.js', revision: null },
        { url: 'assets/useBarcodeScanner-DCaWX9CG.js', revision: null },
        { url: 'assets/UploadHistory-rP64-g7e.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-DMr8XinH.js', revision: null },
        { url: 'assets/Traspasos-DRsIQEBt.js', revision: null },
        { url: 'assets/Transporte-DLYrM8Lj.js', revision: null },
        { url: 'assets/Tickets-Bn-pPLw_.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BXD30edh.js', revision: null },
        { url: 'assets/SolicitudPublica-B5060sm9.js', revision: null },
        { url: 'assets/Seguridad-D6ZTTZ_E.js', revision: null },
        { url: 'assets/securityService-D_auSlP_.js', revision: null },
        { url: 'assets/SalesStatus-oi6JmPca.js', revision: null },
        { url: 'assets/ReceptionNacional-pWzR_k-5.js', revision: null },
        { url: 'assets/Reception-DoJFbVmX.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-B3j7B0Bp.js', revision: null },
        { url: 'assets/Postventa-Bwo_lLRH.js', revision: null },
        { url: 'assets/PodCapture-CGNDNSJR.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-MX1aJkQB.js', revision: null },
        { url: 'assets/panelPtm-ClpKcGSg.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BMNEbZjw.js', revision: null },
        { url: 'assets/PanelInfoReal-CNxN-SBn.js', revision: null },
        { url: 'assets/PanelConfigReal-B-yg8-Jy.js', revision: null },
        { url: 'assets/PanelBuilderReal-yQ2_6Iyt.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-386xB3Mn.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-Bl4XYMmC.js', revision: null },
        { url: 'assets/MiRuta-8cSkF28U.js', revision: null },
        { url: 'assets/MiBandeja-DLoqfpLN.js', revision: null },
        { url: 'assets/logUpload-PfPlpoCw.js', revision: null },
        { url: 'assets/Login-BIvufycR.js', revision: null },
        { url: 'assets/LocationManager-DhUvq3In.js', revision: null },
        { url: 'assets/Insumos-DOjkeK5d.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CxeEJ7P-.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BHpd9hND.js', revision: null },
        { url: 'assets/iamService-CLWaOMRA.js', revision: null },
        { url: 'assets/HistorialNV-CelIJPEo.js', revision: null },
        { url: 'assets/Heatmap-DH9GTpcl.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-TXdL_PAn.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-DdkhHn5l.js', revision: null },
        { url: 'assets/Entry-B8eM_QvE.js', revision: null },
        { url: 'assets/DispatchControl-o0T1e-O5.js', revision: null },
        { url: 'assets/DataImport-Dj7HhL7a.js', revision: null },
        { url: 'assets/dashData-CKgNSMhO.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-B3SEoOLs.js', revision: null },
        { url: 'assets/CubingRegistry-BAs1igB8.js', revision: null },
        { url: 'assets/conteoService-CaVlSqvJ.js', revision: null },
        { url: 'assets/ConteoCiclico-CVLMx9DP.js', revision: null },
        { url: 'assets/ConsultaNV-BK5dzHFH.js', revision: null },
        { url: 'assets/ConsultaGrupo-eFjP7l_j.js', revision: null },
        { url: 'assets/configService-D7hOi_iD.js', revision: null },
        { url: 'assets/comunasChile-ByEmgTje.js', revision: null },
        { url: 'assets/Cleanup-VgKVjL4h.js', revision: null },
        { url: 'assets/ClasificacionProductos-YUeFy-Es.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-Bio5mLqn.js', revision: null },
        { url: 'assets/calidadService-CzMRma0h.js', revision: null },
        { url: 'assets/CalidadBadge-DEFcD27c.js', revision: null },
        { url: 'assets/BodegasSoftland-BLmCQ5Pn.js', revision: null },
        { url: 'assets/BloqueDetalle-BpxHhIvx.js', revision: null },
        { url: 'assets/Batches-Bo99v5Su.js', revision: null },
        { url: 'assets/ApiKeys-DW3zs1nN.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DVuW0Mai.js', revision: null },
        { url: 'assets/AdminMonitor-CzhkvVXp.js', revision: null },
        { url: 'assets/Addresses-BT4E9ECL.js', revision: null },
        { url: 'assets/AccionIntegracion-BzZUW1E1.js', revision: null },
        { url: 'assets/AccionesCalidad-D9pym6Fo.js', revision: null },
        { url: 'assets/AccessControl-BRkx-cCs.js', revision: null },
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
          new s.CacheableResponsePlugin({ statuses: [0, 200] })
        ]
      }),
      'GET'
    ));
});
