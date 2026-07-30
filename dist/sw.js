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
        { url: 'index.html', revision: '89b4058bd27219086b711163aedd1cc6' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-Bo8ENt6F.js', revision: null },
        { url: 'assets/WmsLocations-D0jZ2uNL.js', revision: null },
        { url: 'assets/web-I6FoJSbP.js', revision: null },
        { url: 'assets/web-BB_L043c.js', revision: null },
        { url: 'assets/web-B6GPPOfz.js', revision: null },
        { url: 'assets/warehouseStore-_p7YNPWR.js', revision: null },
        { url: 'assets/WarehousePDA-DyjJKR17.js', revision: null },
        { url: 'assets/Views-a8voD_e6.js', revision: null },
        { url: 'assets/vfs_fonts-C24r0ruI.js', revision: null },
        { url: 'assets/VerificarCertificado-DNCl7eZs.js', revision: null },
        { url: 'assets/useRealtimeTable-DNele5OG.js', revision: null },
        { url: 'assets/useBarcodeScanner-DKnpZSCF.js', revision: null },
        { url: 'assets/UploadHistory-CPSUsUaO.js', revision: null },
        { url: 'assets/ui-vendor-D-9zQVt7.js', revision: null },
        { url: 'assets/TrazabilidadModal-bxu7o_Yb.js', revision: null },
        { url: 'assets/Traspasos-DibDTWPU.js', revision: null },
        { url: 'assets/Transporte-D_KtDpbb.js', revision: null },
        { url: 'assets/Tickets-Cb4PlraP.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-DkqIB62M.js', revision: null },
        { url: 'assets/SolicitudPublica-BEb6kX49.js', revision: null },
        { url: 'assets/Seguridad-oNvUKCRa.js', revision: null },
        { url: 'assets/securityService-B5GHcyr5.js', revision: null },
        { url: 'assets/SalesStatus-gIfmMPj6.js', revision: null },
        { url: 'assets/ReceptionNacional-Bo9UDrnW.js', revision: null },
        { url: 'assets/Reception-D3oYBY73.js', revision: null },
        { url: 'assets/react-vendor-C8fdn38R.js', revision: null },
        { url: 'assets/QueryErrorState-Ca2nvJNI.js', revision: null },
        { url: 'assets/query-vendor-B1MP_4YJ.js', revision: null },
        { url: 'assets/ProductDatasheet-Dqv_9UXF.js', revision: null },
        { url: 'assets/Postventa-7XYUuwRe.js', revision: null },
        { url: 'assets/PodCapture-Cxv9U2W4.js', revision: null },
        { url: 'assets/pickingStore-B6NG5l76.js', revision: null },
        { url: 'assets/pdfmake-BwwREtpy.js', revision: null },
        { url: 'assets/PanelTVReal-D60CxOp8.js', revision: null },
        { url: 'assets/panelPtm-DtqKotAx.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BrWHiqAA.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BBL4hTZ5.js', revision: null },
        { url: 'assets/PanelInfoReal-C_l-BDhj.js', revision: null },
        { url: 'assets/PanelConfigReal-BIJgus3e.js', revision: null },
        { url: 'assets/PanelBuilderReal-DO-tGfsE.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-CVT1FB3f.js', revision: null },
        { url: 'assets/NotFound-3sCqnTFJ.js', revision: null },
        { url: 'assets/Monitoreo-_VsictRU.js', revision: null },
        { url: 'assets/MiRuta-CH5kjyO0.js', revision: null },
        { url: 'assets/MiBandeja-ur6iL3W6.js', revision: null },
        { url: 'assets/logUpload-CYpOJxWb.js', revision: null },
        { url: 'assets/Login-Boqrpbjh.js', revision: null },
        { url: 'assets/LocationManager-CATbcKuz.js', revision: null },
        { url: 'assets/Insumos-DnxWLDa7.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-D1sr-rxq.js', revision: null },
        { url: 'assets/index-CXYp_lIK.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/index-BOtfZs_6.js', revision: null },
        { url: 'assets/iamService-Bcd_llPF.js', revision: null },
        { url: 'assets/HistorialNV-DDqwcGvH.js', revision: null },
        { url: 'assets/Heatmap-BgAaAIp_.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-CTTwaWTO.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-s0n1vWu6.js', revision: null },
        { url: 'assets/Entry-2P0XIVAd.js', revision: null },
        { url: 'assets/DispatchControl-T0Ojb_MN.js', revision: null },
        { url: 'assets/DataImport-DuPMCYRl.js', revision: null },
        { url: 'assets/dashData-DejTfXOa.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-DangwjYs.js', revision: null },
        { url: 'assets/CubingRegistry-B-OufuyM.js', revision: null },
        { url: 'assets/conteoService-BNqZuMAR.js', revision: null },
        { url: 'assets/ConteoCiclico-CiVFyHRF.js', revision: null },
        { url: 'assets/ConsultaNV-DRss2j5F.js', revision: null },
        { url: 'assets/ConsultaGrupo-DVQExw6X.js', revision: null },
        { url: 'assets/configService-DrEg3ek8.js', revision: null },
        { url: 'assets/comunasChile-WR4OqFsB.js', revision: null },
        { url: 'assets/Cleanup-D7eoF4Rj.js', revision: null },
        { url: 'assets/ClasificacionProductos-zhPULL6C.js', revision: null },
        { url: 'assets/charts-vendor-BPHLCusR.js', revision: null },
        { url: 'assets/Carteles-h125hhy8.js', revision: null },
        { url: 'assets/calidadService-Csie-NNe.js', revision: null },
        { url: 'assets/CalidadBadge-BdWGgVyn.js', revision: null },
        { url: 'assets/BodegasSoftland-izIRuYxV.js', revision: null },
        { url: 'assets/BloqueDetalle-DXexzXuL.js', revision: null },
        { url: 'assets/Batches-DSyAR3-s.js', revision: null },
        { url: 'assets/ApiKeys-DR0UGp1b.js', revision: null },
        { url: 'assets/animation-vendor-BwUUObbT.js', revision: null },
        { url: 'assets/AnalisisCodigos-JvBjGtEa.js', revision: null },
        { url: 'assets/AdminMonitor-Cl-NKhgg.js', revision: null },
        { url: 'assets/Addresses-B_88qJpe.js', revision: null },
        { url: 'assets/AccionIntegracion-BWM3njIZ.js', revision: null },
        { url: 'assets/AccionesCalidad-BX1MDxxw.js', revision: null },
        { url: 'assets/AccessControl-CI-WK7a9.js', revision: null },
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
