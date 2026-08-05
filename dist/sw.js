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
        { url: 'index.html', revision: '0cee5d1c5b264d81afc7b27730a75899' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-nlRUKdf5.js', revision: null },
        { url: 'assets/WmsLocations-8htBU2sO.js', revision: null },
        { url: 'assets/web-pYUhpHsS.js', revision: null },
        { url: 'assets/web-mxNF8FN0.js', revision: null },
        { url: 'assets/web-CjjMdnFq.js', revision: null },
        { url: 'assets/warehouseStore-CRqh8g-F.js', revision: null },
        { url: 'assets/WarehousePDA-CpMNzDxs.js', revision: null },
        { url: 'assets/Views-Bbi_ABi8.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-DJBzrjw-.js', revision: null },
        { url: 'assets/useRealtimeTable-CaF3wVA_.js', revision: null },
        { url: 'assets/useBarcodeScanner-2pV1KTKF.js', revision: null },
        { url: 'assets/UploadHistory-zfmb1YMY.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-D-tmfoeK.js', revision: null },
        { url: 'assets/Traspasos-ykJNSoXJ.js', revision: null },
        { url: 'assets/Transporte-DUidA3KM.js', revision: null },
        { url: 'assets/Tickets-CuoP-MJm.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-HIs2yrrT.js', revision: null },
        { url: 'assets/SolicitudPublica-pMsDc_GA.js', revision: null },
        { url: 'assets/Seguridad-Deb96psx.js', revision: null },
        { url: 'assets/securityService-BzfSZm_C.js', revision: null },
        { url: 'assets/SalesStatus-Bcc2VKAD.js', revision: null },
        { url: 'assets/ReceptionNacional-Cg4fXgih.js', revision: null },
        { url: 'assets/Reception-Q1cJUbL4.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CIgCMR7a.js', revision: null },
        { url: 'assets/Postventa-D3DLLHXy.js', revision: null },
        { url: 'assets/PodCapture-FVvmU7E7.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CbBn5HK8.js', revision: null },
        { url: 'assets/panelPtm-C3JXI2_3.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-zGGI4-42.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-BPb9fgBd.js', revision: null },
        { url: 'assets/PanelConfigReal-BKpYpkbx.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-BI7w4pcd.js', revision: null },
        { url: 'assets/Observability-Bt-XmCT1.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-XpU2TDNd.js', revision: null },
        { url: 'assets/MiRuta-TWuCC4p_.js', revision: null },
        { url: 'assets/MiBandeja-qpBgvASd.js', revision: null },
        { url: 'assets/logUpload-Bf7oQrVJ.js', revision: null },
        { url: 'assets/Login-DlaSgSrf.js', revision: null },
        { url: 'assets/LocationManager-DoPELdPS.js', revision: null },
        { url: 'assets/Insumos-Cnv7KTI2.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-B3Z9DSVT.js', revision: null },
        { url: 'assets/index-AbeXgAVI.js', revision: null },
        { url: 'assets/iamService-Df8q-cwW.js', revision: null },
        { url: 'assets/HistorialNV-Qa4WBsFm.js', revision: null },
        { url: 'assets/Heatmap-CpnwjXr_.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DlAnlMZj.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-DKp6rBXA.js', revision: null },
        { url: 'assets/Entry-Dw9gEgV7.js', revision: null },
        { url: 'assets/DispatchControl-BKnF206r.js', revision: null },
        { url: 'assets/DataImport-O6dLJgWD.js', revision: null },
        { url: 'assets/dashData-DWw4ywyz.js', revision: null },
        { url: 'assets/DashboardReal-JuCHcavJ.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-BkoFryfx.js', revision: null },
        { url: 'assets/conteoService-BWrX6ZeL.js', revision: null },
        { url: 'assets/ConteoCiclico-Dc1kOTj1.js', revision: null },
        { url: 'assets/ConsultaNV-ClWBy95g.js', revision: null },
        { url: 'assets/ConsultaGrupo-iWOkb-tR.js', revision: null },
        { url: 'assets/configService-DDCg3Ius.js', revision: null },
        { url: 'assets/comunasChile-BJ35hvBV.js', revision: null },
        { url: 'assets/Cleanup-C7SadAdb.js', revision: null },
        { url: 'assets/ClasificacionProductos-BrIWWwnm.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CZ78n1Ju.js', revision: null },
        { url: 'assets/calidadService-BLHhXQqV.js', revision: null },
        { url: 'assets/CalidadBadge-BB9ebfyA.js', revision: null },
        { url: 'assets/BodegasSoftland-DZVKPsEQ.js', revision: null },
        { url: 'assets/BloqueDetalle-1umC4aCU.js', revision: null },
        { url: 'assets/Batches-DgHC6Xox.js', revision: null },
        { url: 'assets/ApiKeys-DRsLXoLs.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DKczGw2m.js', revision: null },
        { url: 'assets/AdminMonitor-fza5ctfQ.js', revision: null },
        { url: 'assets/Addresses-C11-8u4-.js', revision: null },
        { url: 'assets/AccionIntegracion-BCisqOoK.js', revision: null },
        { url: 'assets/AccionesCalidad-DHF_Nuii.js', revision: null },
        { url: 'assets/AccessControl-BzPKboNl.js', revision: null },
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
