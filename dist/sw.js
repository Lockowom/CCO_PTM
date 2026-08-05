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
define(['./workbox-d8d3a357'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '061830b320f9a686fa2003c54fd6839b' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DaAG9pHG.js', revision: null },
        { url: 'assets/WmsLocations-BaFCzYqO.js', revision: null },
        { url: 'assets/web-DQtfJADm.js', revision: null },
        { url: 'assets/web-CK51SPvn.js', revision: null },
        { url: 'assets/web-Bwqq8t_z.js', revision: null },
        { url: 'assets/warehouseStore-BCTJGy1p.js', revision: null },
        { url: 'assets/WarehousePDA-WmEl7tOf.js', revision: null },
        { url: 'assets/Views-DTRwMO6w.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-BRfXXNtG.js', revision: null },
        { url: 'assets/useRealtimeTable-CSrOtoes.js', revision: null },
        { url: 'assets/useBarcodeScanner-j9saNH5_.js', revision: null },
        { url: 'assets/UploadHistory-DsBVQ8x8.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-ByjNu0Hs.js', revision: null },
        { url: 'assets/Traspasos-BwY9O2u3.js', revision: null },
        { url: 'assets/Transporte-8G7a4i-F.js', revision: null },
        { url: 'assets/Tickets-BS2ii3ST.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-B-uFMr6R.js', revision: null },
        { url: 'assets/SolicitudPublica-DtmMu7-y.js', revision: null },
        { url: 'assets/Seguridad-odkiOUzg.js', revision: null },
        { url: 'assets/securityService-DStHg_lT.js', revision: null },
        { url: 'assets/SalesStatus-DXOS7wQh.js', revision: null },
        { url: 'assets/ReceptionNacional-dl34Xiqc.js', revision: null },
        { url: 'assets/Reception-BM1HCi5c.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-Dnek3-_Q.js', revision: null },
        { url: 'assets/Postventa-cseslii9.js', revision: null },
        { url: 'assets/PodCapture-BnEJpC7w.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-BuGWRvuC.js', revision: null },
        { url: 'assets/panelPtm-BVXEvBgl.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-yUHKPzhI.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-DfYABE2e.js', revision: null },
        { url: 'assets/PanelConfigReal-BaYWSVEd.js', revision: null },
        { url: 'assets/PanelBuilderReal-V7F5rOey.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-DXDq09a7.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-X0WnS5hd.js', revision: null },
        { url: 'assets/MiRuta-B5DUW29-.js', revision: null },
        { url: 'assets/MiBandeja-CEbRkVFg.js', revision: null },
        { url: 'assets/logUpload-CpSrIYNL.js', revision: null },
        { url: 'assets/Login-xi8objFw.js', revision: null },
        { url: 'assets/LocationManager-BAYUMpLe.js', revision: null },
        { url: 'assets/Insumos-C7cXCFzm.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-Cp_Qhvyj.js', revision: null },
        { url: 'assets/index-C8hdJ7IR.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-Fo4u6Owi.js', revision: null },
        { url: 'assets/HistorialNV-BSdyDPYe.js', revision: null },
        { url: 'assets/Heatmap-DC7a2W_d.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-C7JQ5gEt.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-mUXRwSSp.js', revision: null },
        { url: 'assets/Entry-CtAkLCNN.js', revision: null },
        { url: 'assets/DispatchControl-BNlGwaDm.js', revision: null },
        { url: 'assets/DataImport-BhlKbBAD.js', revision: null },
        { url: 'assets/dashData-BHPpsSJy.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-C_EHCj7b.js', revision: null },
        { url: 'assets/CubingRegistry-DSyqNtls.js', revision: null },
        { url: 'assets/conteoService-DuIb9J3Q.js', revision: null },
        { url: 'assets/ConteoCiclico-C_11KTjf.js', revision: null },
        { url: 'assets/ConsultaNV-BoGKHjk_.js', revision: null },
        { url: 'assets/ConsultaGrupo-DlCs-bdT.js', revision: null },
        { url: 'assets/configService-e2Mw5xNb.js', revision: null },
        { url: 'assets/comunasChile-Dz1MsXCi.js', revision: null },
        { url: 'assets/Cleanup-q_nqt6Cn.js', revision: null },
        { url: 'assets/ClasificacionProductos-Hct2ZZxx.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-D23OX4l2.js', revision: null },
        { url: 'assets/calidadService-ChPpq-1p.js', revision: null },
        { url: 'assets/CalidadBadge-3-VTcOnU.js', revision: null },
        { url: 'assets/BodegasSoftland-qllRImzU.js', revision: null },
        { url: 'assets/BloqueDetalle-Bx_e-t2Q.js', revision: null },
        { url: 'assets/Batches-BBqhjCfT.js', revision: null },
        { url: 'assets/ApiKeys-B1uX9ZHB.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-BXJY9j8P.js', revision: null },
        { url: 'assets/AdminMonitor-CPdIYq5H.js', revision: null },
        { url: 'assets/Addresses-DhJsA8wP.js', revision: null },
        { url: 'assets/AccionIntegracion-C6IFVBXz.js', revision: null },
        { url: 'assets/AccionesCalidad-DDz_d2L_.js', revision: null },
        { url: 'assets/AccessControl-BVgBNTTH.js', revision: null },
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
