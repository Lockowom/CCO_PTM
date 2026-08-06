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
        { url: 'index.html', revision: 'f8374320c67d8f367eb77dc660f60b35' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DD1V_W01.js', revision: null },
        { url: 'assets/WmsLocations-V3TaEG2S.js', revision: null },
        { url: 'assets/web-Ch8Iy6zw.js', revision: null },
        { url: 'assets/web-CbdYtRhv.js', revision: null },
        { url: 'assets/web-66bwascH.js', revision: null },
        { url: 'assets/warehouseStore-Bvongpsd.js', revision: null },
        { url: 'assets/WarehousePDA-Bb9rjArr.js', revision: null },
        { url: 'assets/Views-D8AD1fkH.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-oZ1dlyQ5.js', revision: null },
        { url: 'assets/useRealtimeTable-CNfBCB1j.js', revision: null },
        { url: 'assets/useBarcodeScanner-D-M1Av-2.js', revision: null },
        { url: 'assets/UploadHistory-CT7BmjPW.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-amDUTMtf.js', revision: null },
        { url: 'assets/Traspasos-Cz341p-0.js', revision: null },
        { url: 'assets/Transporte-B3sb46JN.js', revision: null },
        { url: 'assets/Tickets-rH8GiL4D.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Bbk3C3kP.js', revision: null },
        { url: 'assets/SolicitudPublica-Ac69g-kE.js', revision: null },
        { url: 'assets/Seguridad-CxvrfDWc.js', revision: null },
        { url: 'assets/securityService-D85JqkaE.js', revision: null },
        { url: 'assets/SalesStatus-B8z8fmei.js', revision: null },
        { url: 'assets/ReceptionNacional-TFjvxsKL.js', revision: null },
        { url: 'assets/Reception-ZcIteUUm.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CjnxRWYU.js', revision: null },
        { url: 'assets/Postventa-FwdxUC_W.js', revision: null },
        { url: 'assets/PodCapture-B9YkY_V6.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-BWRGBbbg.js', revision: null },
        { url: 'assets/panelPtm-CkJlvOUH.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CY14AT5w.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-N8_lkjom.js', revision: null },
        { url: 'assets/PanelConfigReal-xfLsyz59.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-BNUwPAuj.js', revision: null },
        { url: 'assets/Observability-Co4woL3P.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-CcJm_2GL.js', revision: null },
        { url: 'assets/MiRuta-M6qpH5ni.js', revision: null },
        { url: 'assets/MiBandeja-BJQhurbk.js', revision: null },
        { url: 'assets/logUpload-BXHwWgDL.js', revision: null },
        { url: 'assets/Login-CQzP3ils.js', revision: null },
        { url: 'assets/LocationManager-DxVpund2.js', revision: null },
        { url: 'assets/Insumos-uv07p9QD.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CWp4k_wK.js', revision: null },
        { url: 'assets/index-CvnzWbLN.css', revision: null },
        { url: 'assets/index-Cm4s-gCR.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-BVfhD0PT.js', revision: null },
        { url: 'assets/HistorialNV-BurAJoDI.js', revision: null },
        { url: 'assets/Heatmap-CaD2HHx2.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-dAzS3zjp.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-BGOJnykL.js', revision: null },
        { url: 'assets/Entry-BVnlYGi-.js', revision: null },
        { url: 'assets/DispatchControl-CvCl6Scd.js', revision: null },
        { url: 'assets/DataImport-Cyl9hD86.js', revision: null },
        { url: 'assets/dashData-BOkTkNEg.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BqPXQ-jj.js', revision: null },
        { url: 'assets/CubingRegistry-zV8c3si2.js', revision: null },
        { url: 'assets/conteoService-CHLTC1CP.js', revision: null },
        { url: 'assets/ConteoCiclico-CZRWe-ll.js', revision: null },
        { url: 'assets/ConsultaNV-B6Fegs2H.js', revision: null },
        { url: 'assets/ConsultaGrupo-CuKMtGok.js', revision: null },
        { url: 'assets/configService-pT89p9DV.js', revision: null },
        { url: 'assets/comunasChile-CXHj1sVr.js', revision: null },
        { url: 'assets/Cleanup-rKuOqHK7.js', revision: null },
        { url: 'assets/ClasificacionProductos-y8oAVxiX.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DON9XuRN.js', revision: null },
        { url: 'assets/calidadService-CvZjBxJa.js', revision: null },
        { url: 'assets/CalidadBadge-BUGYsfyF.js', revision: null },
        { url: 'assets/BodegasSoftland-7HsF6TFt.js', revision: null },
        { url: 'assets/BloqueDetalle-BzC8WLrb.js', revision: null },
        { url: 'assets/Batches-HXip4xv3.js', revision: null },
        { url: 'assets/ApiKeys-Bor5mzpl.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DE6lMm8C.js', revision: null },
        { url: 'assets/AdminMonitor-C9nJc0Mh.js', revision: null },
        { url: 'assets/Addresses-d2tpN5cm.js', revision: null },
        { url: 'assets/AccionIntegracion-CV_2I7fn.js', revision: null },
        { url: 'assets/AccionesCalidad--y6es8WQ.js', revision: null },
        { url: 'assets/AccessControl-CMlHVSHy.js', revision: null },
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
