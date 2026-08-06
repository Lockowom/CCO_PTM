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
        { url: 'index.html', revision: '0449383a8a1c7f1d23615a07f0185827' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-GCqjzklY.js', revision: null },
        { url: 'assets/WmsLocations-QlinY2l9.js', revision: null },
        { url: 'assets/web-DORx90vM.js', revision: null },
        { url: 'assets/web-D5Ea9Nm1.js', revision: null },
        { url: 'assets/web-BlkDEXT4.js', revision: null },
        { url: 'assets/warehouseStore-BNaVJYXJ.js', revision: null },
        { url: 'assets/WarehousePDA-BjcxWPh8.js', revision: null },
        { url: 'assets/Views-MAN3Bs0X.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-DEj1YYRB.js', revision: null },
        { url: 'assets/useRealtimeTable-BLhFpApk.js', revision: null },
        { url: 'assets/useBarcodeScanner-DF7LqIOM.js', revision: null },
        { url: 'assets/UploadHistory-HkT1mqbg.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-B3BI7DPc.js', revision: null },
        { url: 'assets/Traspasos-BA_9PMhP.js', revision: null },
        { url: 'assets/Transporte-CIhaXpzs.js', revision: null },
        { url: 'assets/Tickets-DQlMVaIN.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-CRuzJYeO.js', revision: null },
        { url: 'assets/SolicitudPublica-Bpicxw_D.js', revision: null },
        { url: 'assets/Seguridad-DYwAe5S9.js', revision: null },
        { url: 'assets/securityService-CHheSDTZ.js', revision: null },
        { url: 'assets/SalesStatus-D_M-PKlR.js', revision: null },
        { url: 'assets/ReceptionNacional-C2L-v5F_.js', revision: null },
        { url: 'assets/Reception-BI-aIOZK.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-DpSPGD1H.js', revision: null },
        { url: 'assets/Postventa-V4FMiJES.js', revision: null },
        { url: 'assets/PodCapture-BVOfQA_t.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-C0YWHz5W.js', revision: null },
        { url: 'assets/panelPtm-CmT609pK.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-D7RKFQ4q.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-CUh_Y8UE.js', revision: null },
        { url: 'assets/PanelConfigReal-DpbD8VPT.js', revision: null },
        { url: 'assets/PanelBuilderReal-XK2YhoXZ.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-5DzumfXP.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-DMLAZEy2.js', revision: null },
        { url: 'assets/MiRuta-B3RK9Ml5.js', revision: null },
        { url: 'assets/MiBandeja-yF102PKT.js', revision: null },
        { url: 'assets/logUpload-Blds2YoL.js', revision: null },
        { url: 'assets/Login-BxHGJGEt.js', revision: null },
        { url: 'assets/LocationManager-2994iqTx.js', revision: null },
        { url: 'assets/Insumos-DK8mAMKZ.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DpILVet-.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CJpoExlo.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-CxrtFLLQ.js', revision: null },
        { url: 'assets/HistorialNV-oO03XyR8.js', revision: null },
        { url: 'assets/Heatmap-CWyZ56p7.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-57jTatid.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-Cu8arlPr.js', revision: null },
        { url: 'assets/Entry-DmmWfk8F.js', revision: null },
        { url: 'assets/DispatchControl-BWi3XZTt.js', revision: null },
        { url: 'assets/DataImport-CKcIFFW_.js', revision: null },
        { url: 'assets/dashData-BLSkVwCa.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-COekHSW-.js', revision: null },
        { url: 'assets/CubingRegistry-BuVZa4-1.js', revision: null },
        { url: 'assets/conteoService-BufLfMVw.js', revision: null },
        { url: 'assets/ConteoCiclico-J_mgxJ4A.js', revision: null },
        { url: 'assets/ConsultaNV-BNr-FURA.js', revision: null },
        { url: 'assets/ConsultaGrupo-D0qjYOS9.js', revision: null },
        { url: 'assets/configService-BITvKe89.js', revision: null },
        { url: 'assets/comunasChile-BFbFb3KA.js', revision: null },
        { url: 'assets/Cleanup-DhFGcQwE.js', revision: null },
        { url: 'assets/ClasificacionProductos-8YwaImIm.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-6147EfqA.js', revision: null },
        { url: 'assets/calidadService-PAFf_qhK.js', revision: null },
        { url: 'assets/CalidadBadge-BTwqQBB0.js', revision: null },
        { url: 'assets/BodegasSoftland-CnXGQGKW.js', revision: null },
        { url: 'assets/BloqueDetalle-l0WGmAPx.js', revision: null },
        { url: 'assets/Batches-CXprLa_Z.js', revision: null },
        { url: 'assets/ApiKeys-7XbxEsPO.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DJ8OHnX6.js', revision: null },
        { url: 'assets/AdminMonitor-N1bUMgph.js', revision: null },
        { url: 'assets/Addresses-CnMpyroP.js', revision: null },
        { url: 'assets/AccionIntegracion-Co33iSLy.js', revision: null },
        { url: 'assets/AccionesCalidad-BcWjmQRL.js', revision: null },
        { url: 'assets/AccessControl-Doi0Uxq-.js', revision: null },
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
