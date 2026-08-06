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
        { url: 'index.html', revision: 'e7316a380829af7b83cead7e9c586bb4' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-CnVx1cln.js', revision: null },
        { url: 'assets/WmsLocations-Dk5kHUHv.js', revision: null },
        { url: 'assets/web-dsOUyT9T.js', revision: null },
        { url: 'assets/web-DoVagASW.js', revision: null },
        { url: 'assets/web-C8fxUfys.js', revision: null },
        { url: 'assets/warehouseStore-CnP7pFRu.js', revision: null },
        { url: 'assets/WarehousePDA-5hzmFLgt.js', revision: null },
        { url: 'assets/Views-Dh5cuKC0.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-CFeG4gZe.js', revision: null },
        { url: 'assets/useRealtimeTable-BUhXLVSA.js', revision: null },
        { url: 'assets/useBarcodeScanner-C6Fp_FeG.js', revision: null },
        { url: 'assets/UploadHistory-CHoX69sq.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-B84gmVPx.js', revision: null },
        { url: 'assets/Traspasos-9vm_ZG_U.js', revision: null },
        { url: 'assets/Transporte-BA_AKI68.js', revision: null },
        { url: 'assets/Tickets-Bv5vNFta.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Bzvs5Ps_.js', revision: null },
        { url: 'assets/SolicitudPublica-D9q62jXU.js', revision: null },
        { url: 'assets/Seguridad-C_nK610H.js', revision: null },
        { url: 'assets/securityService-BihpyPf5.js', revision: null },
        { url: 'assets/SalesStatus-BMcEyo59.js', revision: null },
        { url: 'assets/ReceptionNacional-Bhv_NdUm.js', revision: null },
        { url: 'assets/Reception-tIlWiHL0.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CxEnPKIM.js', revision: null },
        { url: 'assets/Postventa--BRQnBqw.js', revision: null },
        { url: 'assets/PodCapture-f1RMKfjf.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-k9YvE7cd.js', revision: null },
        { url: 'assets/panelPtm-Bl5U8lI3.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-D6Fb-qwc.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-D64-cA61.js', revision: null },
        { url: 'assets/PanelConfigReal-BLD7Ky9u.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-bsZYhG7l.js', revision: null },
        { url: 'assets/Observability-Dt5oNcSA.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-Ej7Lx3tZ.js', revision: null },
        { url: 'assets/MiRuta-CXvFiu1F.js', revision: null },
        { url: 'assets/MiBandeja-DpOdrCmC.js', revision: null },
        { url: 'assets/logUpload-D-ZS9JO-.js', revision: null },
        { url: 'assets/Login-CX-FuIaM.js', revision: null },
        { url: 'assets/LocationManager-BoOePkk8.js', revision: null },
        { url: 'assets/Insumos-CEUFO_g6.js', revision: null },
        { url: 'assets/index-p00P9Vd6.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-Cg-6XdaK.css', revision: null },
        { url: 'assets/index-BVkgVG0h.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-BhWpQSqI.js', revision: null },
        { url: 'assets/HistorialNV-D-Mjv4IA.js', revision: null },
        { url: 'assets/Heatmap-Do1oTRfM.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Dg8pHHo2.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-CXGsf8Yp.js', revision: null },
        { url: 'assets/Entry-BurQNyD3.js', revision: null },
        { url: 'assets/DispatchControl-C526cTAx.js', revision: null },
        { url: 'assets/DataImport-BQIFa4RN.js', revision: null },
        { url: 'assets/dashData-Cmw4RZX6.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CJ9kDMZV.js', revision: null },
        { url: 'assets/CubingRegistry-BCgpBkWQ.js', revision: null },
        { url: 'assets/conteoService-C1eLkuwA.js', revision: null },
        { url: 'assets/ConteoCiclico-CqQAQIJ4.js', revision: null },
        { url: 'assets/ConsultaNV-BFTnAt6Z.js', revision: null },
        { url: 'assets/ConsultaGrupo-CGQVxNOE.js', revision: null },
        { url: 'assets/configService-FCkxrbZH.js', revision: null },
        { url: 'assets/comunasChile-BDO-6gps.js', revision: null },
        { url: 'assets/Cleanup-CU6GBM7s.js', revision: null },
        { url: 'assets/ClasificacionProductos-Bnd6kWHw.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CRgHfYbF.js', revision: null },
        { url: 'assets/calidadService-CmehGl8F.js', revision: null },
        { url: 'assets/CalidadBadge-CEy3vZj1.js', revision: null },
        { url: 'assets/BodegasSoftland-BJAyqVDq.js', revision: null },
        { url: 'assets/BloqueDetalle-DJHRwxcQ.js', revision: null },
        { url: 'assets/Batches-_wYx2JBt.js', revision: null },
        { url: 'assets/ApiKeys-dXh3uFa-.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-bJjt7OT_.js', revision: null },
        { url: 'assets/AdminMonitor-MK5QcOhf.js', revision: null },
        { url: 'assets/Addresses-D6gQS4Jz.js', revision: null },
        { url: 'assets/AccionIntegracion-CARTJjw5.js', revision: null },
        { url: 'assets/AccionesCalidad-DoM6mVSj.js', revision: null },
        { url: 'assets/AccessControl-Bhv6F4MP.js', revision: null },
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
