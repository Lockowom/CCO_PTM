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
define(['./workbox-38ae441a'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '59f3c4822b41d41690abfda8ddcd3db9' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-ClNBcc-f.js', revision: null },
        { url: 'assets/WmsLocations-Bf9FKX7f.js', revision: null },
        { url: 'assets/web-eva-bG0K.js', revision: null },
        { url: 'assets/web-DsQ8HorT.js', revision: null },
        { url: 'assets/web-DorNu-ol.js', revision: null },
        { url: 'assets/warehouseStore-Df50jZj0.js', revision: null },
        { url: 'assets/WarehousePDA-Cm-ZmzdN.js', revision: null },
        { url: 'assets/Views-Cz5empy-.js', revision: null },
        { url: 'assets/vfs_fonts-C24r0ruI.js', revision: null },
        { url: 'assets/VerificarCertificado-WW9Z4QJl.js', revision: null },
        { url: 'assets/useRealtimeTable-CZzxry10.js', revision: null },
        { url: 'assets/useBarcodeScanner-Bj4zrwE7.js', revision: null },
        { url: 'assets/UploadHistory-D8reEsHV.js', revision: null },
        { url: 'assets/ui-vendor-D-9zQVt7.js', revision: null },
        { url: 'assets/TrazabilidadModal-B_0GAsoG.js', revision: null },
        { url: 'assets/Traspasos-CRmqnga3.js', revision: null },
        { url: 'assets/Transporte-Cw82XADd.js', revision: null },
        { url: 'assets/Tickets-BLjWtxeG.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-BR2WXHb2.js', revision: null },
        { url: 'assets/SolicitudPublica-BpGwDImB.js', revision: null },
        { url: 'assets/Seguridad-BHAb5k4E.js', revision: null },
        { url: 'assets/securityService-D2iO_YDb.js', revision: null },
        { url: 'assets/SalesStatus-Fqzitq1w.js', revision: null },
        { url: 'assets/ReceptionNacional-xMJXJjfK.js', revision: null },
        { url: 'assets/Reception-WXjkUfal.js', revision: null },
        { url: 'assets/react-vendor-C8fdn38R.js', revision: null },
        { url: 'assets/QueryErrorState-Ca2nvJNI.js', revision: null },
        { url: 'assets/query-vendor-B1MP_4YJ.js', revision: null },
        { url: 'assets/ProductDatasheet-8IMz_br3.js', revision: null },
        { url: 'assets/Postventa-C_rHYkfI.js', revision: null },
        { url: 'assets/PodCapture-BvC9hbxL.js', revision: null },
        { url: 'assets/pickingStore-B6NG5l76.js', revision: null },
        { url: 'assets/pdfmake-BwwREtpy.js', revision: null },
        { url: 'assets/PanelTVReal-TzlGNhsL.js', revision: null },
        { url: 'assets/panelPtm-BhRkcfwp.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BrWHiqAA.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-CKUiaE9-.js', revision: null },
        { url: 'assets/PanelInfoReal-2Qqk1Gtu.js', revision: null },
        { url: 'assets/PanelConfigReal-DVriCksV.js', revision: null },
        { url: 'assets/PanelBuilderReal-Cw7UODAn.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-C68rkqCg.js', revision: null },
        { url: 'assets/NotFound-3sCqnTFJ.js', revision: null },
        { url: 'assets/Monitoreo-CmHVRcSD.js', revision: null },
        { url: 'assets/MiRuta-BMHqo_jA.js', revision: null },
        { url: 'assets/MiBandeja-Dm7KEdA-.js', revision: null },
        { url: 'assets/logUpload-CE3qpBB6.js', revision: null },
        { url: 'assets/Login-Iok6bubd.js', revision: null },
        { url: 'assets/LocationManager-2I3QJLKO.js', revision: null },
        { url: 'assets/Insumos-CJkycsoe.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-D3K83tgM.js', revision: null },
        { url: 'assets/index-CXYp_lIK.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-B17yJZ4F.js', revision: null },
        { url: 'assets/iamService-2VAmo1Ib.js', revision: null },
        { url: 'assets/HistorialNV-DOwJq5MF.js', revision: null },
        { url: 'assets/Heatmap-Bw02E6_y.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-rPEQSto7.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-CdYgJ62v.js', revision: null },
        { url: 'assets/Entry-CwM1vPNm.js', revision: null },
        { url: 'assets/DispatchControl-9IG1ZOzU.js', revision: null },
        { url: 'assets/DataImport-vCiBb_Re.js', revision: null },
        { url: 'assets/dashData-DV-hugLV.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BUdtfFMo.js', revision: null },
        { url: 'assets/CubingRegistry-B4VenqJ3.js', revision: null },
        { url: 'assets/conteoService-GxSmruy9.js', revision: null },
        { url: 'assets/ConteoCiclico-Cbc4rpVk.js', revision: null },
        { url: 'assets/ConsultaNV-pnjyy8Ws.js', revision: null },
        { url: 'assets/ConsultaGrupo-DuNHBthu.js', revision: null },
        { url: 'assets/configService-q7itzlPg.js', revision: null },
        { url: 'assets/comunasChile-Cb2oA8ID.js', revision: null },
        { url: 'assets/Cleanup-CSjfk0FQ.js', revision: null },
        { url: 'assets/ClasificacionProductos-DE_GUfj1.js', revision: null },
        { url: 'assets/charts-vendor-BPHLCusR.js', revision: null },
        { url: 'assets/Carteles-7tkc1DV7.js', revision: null },
        { url: 'assets/calidadService-D1Qd8EzY.js', revision: null },
        { url: 'assets/CalidadBadge-Dhmh6sr1.js', revision: null },
        { url: 'assets/BodegasSoftland-Df2GQt4I.js', revision: null },
        { url: 'assets/BloqueDetalle-D3AS7jug.js', revision: null },
        { url: 'assets/Batches-1T74Ujiy.js', revision: null },
        { url: 'assets/ApiKeys-DE1bemnJ.js', revision: null },
        { url: 'assets/animation-vendor-BwUUObbT.js', revision: null },
        { url: 'assets/AnalisisCodigos-E3qkuQ2B.js', revision: null },
        { url: 'assets/AdminMonitor-DCEJAsBX.js', revision: null },
        { url: 'assets/Addresses-CMrXYSm6.js', revision: null },
        { url: 'assets/AccionIntegracion-B_rMBURA.js', revision: null },
        { url: 'assets/AccionesCalidad-uLwMeF65.js', revision: null },
        { url: 'assets/AccessControl-0u4PpRob.js', revision: null },
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
