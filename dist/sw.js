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
        { url: 'index.html', revision: '78a9fa2fb30e36ae6b6cf01af5cd1c00' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-ZiNSLNTT.js', revision: null },
        { url: 'assets/WmsLocations-MxZ_WNt8.js', revision: null },
        { url: 'assets/web-DPiHfjWU.js', revision: null },
        { url: 'assets/web-CXIfYY8h.js', revision: null },
        { url: 'assets/web-BYadsJwq.js', revision: null },
        { url: 'assets/warehouseStore-CKhthwA1.js', revision: null },
        { url: 'assets/WarehousePDA-CntFaTEQ.js', revision: null },
        { url: 'assets/Views-CJ1mQq80.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-k4YQe1uP.js', revision: null },
        { url: 'assets/useRealtimeTable-DZ7a5LjY.js', revision: null },
        { url: 'assets/useBarcodeScanner-DMjW0yNi.js', revision: null },
        { url: 'assets/UploadHistory-BfP-aiMt.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-DIzo-IiX.js', revision: null },
        { url: 'assets/Traspasos-Cpccdm59.js', revision: null },
        { url: 'assets/Transporte-BXfYE7VC.js', revision: null },
        { url: 'assets/Tickets-B7GvYcLl.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-C0ukYBST.js', revision: null },
        { url: 'assets/SolicitudPublica-WjOlUl9w.js', revision: null },
        { url: 'assets/Seguridad-BgdPFRy_.js', revision: null },
        { url: 'assets/securityService-I4LRk_-k.js', revision: null },
        { url: 'assets/SalesStatus-BW5Zj5r1.js', revision: null },
        { url: 'assets/ReceptionNacional-_xBLzMeC.js', revision: null },
        { url: 'assets/Reception-DOx7X4KR.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-BdmGJ37o.js', revision: null },
        { url: 'assets/Postventa-D-bmARvF.js', revision: null },
        { url: 'assets/PodCapture--95ju_an.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-D6yLslVE.js', revision: null },
        { url: 'assets/panelPtm-BWg2o-yM.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BBAOf5Pt.js', revision: null },
        { url: 'assets/PanelInfoReal-fbc553EE.js', revision: null },
        { url: 'assets/PanelConfigReal-CTGYj4Q2.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-Cgr1Ktmq.js', revision: null },
        { url: 'assets/Observability-C_z_k1gm.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-6F_9gJ8t.js', revision: null },
        { url: 'assets/MiRuta-DwEQ5HkS.js', revision: null },
        { url: 'assets/MiBandeja-DTQ9wazD.js', revision: null },
        { url: 'assets/logUpload-C3ZrX4xW.js', revision: null },
        { url: 'assets/Login-CEmIJl5W.js', revision: null },
        { url: 'assets/LocationManager-DZo--zGA.js', revision: null },
        { url: 'assets/Insumos-Dae5qVcq.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-D7zYGonf.js', revision: null },
        { url: 'assets/index-CyF0yQ6M.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-8X0tyJsS.js', revision: null },
        { url: 'assets/HistorialNV-vb-fGWuz.js', revision: null },
        { url: 'assets/Heatmap-HHIN88pU.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DJ1psAom.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-ChC0PI3H.js', revision: null },
        { url: 'assets/Entry-C8feNJzq.js', revision: null },
        { url: 'assets/DispatchControl-CDQ0J18o.js', revision: null },
        { url: 'assets/DataImport-DBnAc2wU.js', revision: null },
        { url: 'assets/dashData-DHv93Vaf.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CBIEuf0d.js', revision: null },
        { url: 'assets/CubingRegistry-_jtsClWx.js', revision: null },
        { url: 'assets/conteoService-BpXDmuV1.js', revision: null },
        { url: 'assets/ConteoCiclico-BTvdY7e5.js', revision: null },
        { url: 'assets/ConsultaNV-Di7qSwB6.js', revision: null },
        { url: 'assets/ConsultaGrupo-9S5KqM7W.js', revision: null },
        { url: 'assets/configService-DdfVj8fW.js', revision: null },
        { url: 'assets/comunasChile-DY_3Z_CH.js', revision: null },
        { url: 'assets/Cleanup-C6BpahB4.js', revision: null },
        { url: 'assets/ClasificacionProductos-DJDumqbd.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CpwFtdHS.js', revision: null },
        { url: 'assets/calidadService-jC2jrBKm.js', revision: null },
        { url: 'assets/CalidadBadge-B57EBgHL.js', revision: null },
        { url: 'assets/BodegasSoftland-CphJTmmO.js', revision: null },
        { url: 'assets/BloqueDetalle-2w_Ry2-f.js', revision: null },
        { url: 'assets/Batches-B9u-a8Dc.js', revision: null },
        { url: 'assets/ApiKeys-CvGSRsf4.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-_raxi4Qz.js', revision: null },
        { url: 'assets/AdminMonitor-BuXATx4w.js', revision: null },
        { url: 'assets/Addresses-CvUBUHO8.js', revision: null },
        { url: 'assets/AccionIntegracion-Fryjgweh.js', revision: null },
        { url: 'assets/AccionesCalidad-Bzeg6aBk.js', revision: null },
        { url: 'assets/AccessControl-Ze3YoTiZ.js', revision: null },
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
