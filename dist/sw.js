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
define(['./workbox-8925e955'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '1872c500de691dce40960bb85481de07' },
        { url: 'logo-ptm.png', revision: '85d35b22e6bfb4eba6d9c61152c883c3' },
        { url: 'index.html', revision: '2bdf66098735b1ae2a0eb154da0f221a' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BZdIyJOh.js', revision: null },
        { url: 'assets/WmsLocations-DKlz0LAu.js', revision: null },
        { url: 'assets/web-ZkU4VSrY.js', revision: null },
        { url: 'assets/web-DUrkx1L3.js', revision: null },
        { url: 'assets/web-Dk6o3Jkp.js', revision: null },
        { url: 'assets/web-DDC19FQm.js', revision: null },
        { url: 'assets/web-CE4xbnnO.js', revision: null },
        { url: 'assets/warehouseStore-LLKxVW1M.js', revision: null },
        { url: 'assets/WarehousePDA-P3Xrf_Pj.js', revision: null },
        { url: 'assets/Views-_XP9HUff.js', revision: null },
        { url: 'assets/vfs_fonts-8ICcZKi6.js', revision: null },
        { url: 'assets/VerificarCertificado-CgaXbO2t.js', revision: null },
        { url: 'assets/useRealtimeTable-7JQgQ4NY.js', revision: null },
        { url: 'assets/useBarcodeScanner-BNkS6wI8.js', revision: null },
        { url: 'assets/UploadHistory-BR0Mek5q.js', revision: null },
        { url: 'assets/ui-vendor-DggzEJgL.js', revision: null },
        { url: 'assets/TrazabilidadModal-5GbThej2.js', revision: null },
        { url: 'assets/Traspasos-C8MVgSKk.js', revision: null },
        { url: 'assets/Transporte-Bdx1CIf4.js', revision: null },
        { url: 'assets/Tickets-CpOvW5U_.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-DXi8LLxG.js', revision: null },
        { url: 'assets/SolicitudPublica-D1CkIShI.js', revision: null },
        { url: 'assets/Seguridad-D8XN2fiV.js', revision: null },
        { url: 'assets/securityService-DnBcO6ua.js', revision: null },
        { url: 'assets/SalesStatus-DDxMPUBn.js', revision: null },
        { url: 'assets/RendicionPublica-C4fvhSTw.js', revision: null },
        { url: 'assets/RendicionPublica-BN2mcQnR.css', revision: null },
        { url: 'assets/Rendiciones-D6tU-BiO.js', revision: null },
        { url: 'assets/Rendiciones-CJpc4fH8.css', revision: null },
        { url: 'assets/ReceptionNacional-CzuDEbRP.js', revision: null },
        { url: 'assets/Reception-BloohfPX.js', revision: null },
        { url: 'assets/react-vendor-CByR7_Pi.js', revision: null },
        { url: 'assets/QueryErrorState-Cdj6be9r.js', revision: null },
        { url: 'assets/query-vendor-CzTZLhyg.js', revision: null },
        { url: 'assets/publicUrl-BQzKh4Fr.js', revision: null },
        { url: 'assets/ProductDatasheet-BwDnOMi5.js', revision: null },
        { url: 'assets/postventaService-CWcX6yd_.js', revision: null },
        { url: 'assets/Postventa-DccI5wLC.js', revision: null },
        { url: 'assets/PodCapture-BYhTqmuY.js', revision: null },
        { url: 'assets/pickingStore-mdmE-vKf.js', revision: null },
        { url: 'assets/pdfmake-CkMY3Ap1.js', revision: null },
        { url: 'assets/PanelTVReal-Ci--vRzn.js', revision: null },
        { url: 'assets/panelPtm-NWLfEp6V.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-B4zIScak.js', revision: null },
        { url: 'assets/PanelIngresar-DyevDNXI.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-DdygmVB4.js', revision: null },
        { url: 'assets/PanelConfigReal-DYDPct-C.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-CE85FThN.js', revision: null },
        { url: 'assets/Observability-Bgd9Dwxi.js', revision: null },
        { url: 'assets/NotFound-BFvHGV2A.js', revision: null },
        { url: 'assets/Monitoreo-CQH62uPj.js', revision: null },
        { url: 'assets/MiRuta-B6Cq8y3l.js', revision: null },
        { url: 'assets/MiBandeja-DyfX2pvP.js', revision: null },
        { url: 'assets/logUpload-DyKNEMYe.js', revision: null },
        { url: 'assets/Login-EPa4lCR3.js', revision: null },
        { url: 'assets/LocationRequests-DkeeaRI1.js', revision: null },
        { url: 'assets/LocationManager-Cupy0sre.js', revision: null },
        { url: 'assets/Insumos-DC0N1x4B.js', revision: null },
        { url: 'assets/ingresarService-_cVRia8V.js', revision: null },
        { url: 'assets/index-DpKQy1E-.js', revision: null },
        { url: 'assets/index-CZWfQUyl.css', revision: null },
        { url: 'assets/index-BnmgyfKI.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BlrY7iKz.js', revision: null },
        { url: 'assets/iamService-E3jevzDt.js', revision: null },
        { url: 'assets/HistorialNV-wEX8TKb5.js', revision: null },
        { url: 'assets/Heatmap-t-pKmNB0.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-BxT6D5ZG.js', revision: null },
        { url: 'assets/exportRendicion-aJhfvaB-.js', revision: null },
        { url: 'assets/exportExcel-CrAs1BHm.js', revision: null },
        { url: 'assets/Eventos-CsUFmpiE.js', revision: null },
        { url: 'assets/Entry-B_brCKkx.js', revision: null },
        { url: 'assets/DispatchControl-DR1tPlke.js', revision: null },
        { url: 'assets/DataImport-BnrCl92P.js', revision: null },
        { url: 'assets/dashData-BZs8HG2n.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-C789PIvR.js', revision: null },
        { url: 'assets/CubingRegistry-CE3bmdma.js', revision: null },
        { url: 'assets/CoordinacionRutas-DDmdtbX4.js', revision: null },
        { url: 'assets/CoordinacionRutas-CROBlODP.css', revision: null },
        { url: 'assets/conteoService-BG4qmv-9.js', revision: null },
        { url: 'assets/ConteoCiclico-C5SJKPDv.js', revision: null },
        { url: 'assets/ConsultaNV-wDyiLylI.js', revision: null },
        { url: 'assets/ConsultaGrupo-CHCXGhif.js', revision: null },
        { url: 'assets/configService-CG_zb7ud.js', revision: null },
        { url: 'assets/comunasChile-r58VwwUH.js', revision: null },
        { url: 'assets/Cleanup-8rCDCgyO.js', revision: null },
        { url: 'assets/ClasificacionProductos-C932wdZz.js', revision: null },
        { url: 'assets/charts-vendor-C4xrueP1.js', revision: null },
        { url: 'assets/Carteles-BvefAmmN.js', revision: null },
        { url: 'assets/calidadService--yDCooYO.js', revision: null },
        { url: 'assets/CalidadBadge-Doq1PKT5.js', revision: null },
        { url: 'assets/BodegasSoftland-CgyD-MsB.js', revision: null },
        { url: 'assets/BloqueDetalle-CrUVaHJ7.js', revision: null },
        { url: 'assets/Batches-BJMRhMTh.js', revision: null },
        { url: 'assets/BandejaReaperturas-PhEM5ULj.js', revision: null },
        { url: 'assets/ApiKeys-Cg37PLHc.js', revision: null },
        { url: 'assets/animation-vendor-DqxLxWcj.js', revision: null },
        { url: 'assets/AnalisisCodigos-CVjUKNeV.js', revision: null },
        { url: 'assets/AdminMonitor-lN6j_vSw.js', revision: null },
        { url: 'assets/Addresses-BFR2BKXd.js', revision: null },
        { url: 'assets/AccionIntegracion-B6ECVJTp.js', revision: null },
        { url: 'assets/AccionesCalidad-lj6oI3K3.js', revision: null },
        { url: 'assets/AccessControl-R0nzUcjb.js', revision: null },
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
