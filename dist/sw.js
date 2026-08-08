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
        { url: 'index.html', revision: '798b00d2d510eea46d3338e6d5111193' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BQhIk6iy.js', revision: null },
        { url: 'assets/WmsLocations-C5hzP3MV.js', revision: null },
        { url: 'assets/web-TbG1VwM-.js', revision: null },
        { url: 'assets/web-mrCNcPC9.js', revision: null },
        { url: 'assets/web-DoLT16Cv.js', revision: null },
        { url: 'assets/warehouseStore-DR2YIYm7.js', revision: null },
        { url: 'assets/WarehousePDA-Bv0_oC5t.js', revision: null },
        { url: 'assets/Views-DwRsqnPD.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-BlBAvZlb.js', revision: null },
        { url: 'assets/useRealtimeTable-B9hpijty.js', revision: null },
        { url: 'assets/useBarcodeScanner-iVQFoB83.js', revision: null },
        { url: 'assets/UploadHistory-BsZrYAeG.js', revision: null },
        { url: 'assets/ui-vendor-Da7ysJ4B.js', revision: null },
        { url: 'assets/TrazabilidadModal-B12lwxlL.js', revision: null },
        { url: 'assets/Traspasos-CXd8tqqb.js', revision: null },
        { url: 'assets/Transporte--8kSii3B.js', revision: null },
        { url: 'assets/Tickets-BHkftLe0.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-8SJgyTNK.js', revision: null },
        { url: 'assets/SolicitudPublica-3E_Uv02y.js', revision: null },
        { url: 'assets/Seguridad-Dax4AsQm.js', revision: null },
        { url: 'assets/securityService-DN7k4U3D.js', revision: null },
        { url: 'assets/SalesStatus-BedDT5nD.js', revision: null },
        { url: 'assets/ReceptionNacional-BA5fy77S.js', revision: null },
        { url: 'assets/Reception-CzN-I9Gm.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-CEtRWa_X.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-DLRSM2wp.js', revision: null },
        { url: 'assets/Postventa-P7pC88Si.js', revision: null },
        { url: 'assets/PodCapture-iCe-cIwE.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-BIOCVB6v.js', revision: null },
        { url: 'assets/panelPtm-lL-vto0j.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-DYkcaft9.js', revision: null },
        { url: 'assets/PanelIngresar-DVHRTuiy.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-C0123cDP.js', revision: null },
        { url: 'assets/PanelConfigReal-CSMNwSM6.js', revision: null },
        { url: 'assets/PanelBuilderReal-CTlc4mc1.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-Dh9fKzU3.js', revision: null },
        { url: 'assets/NotFound-zif4GsID.js', revision: null },
        { url: 'assets/Monitoreo-BG8SkGRq.js', revision: null },
        { url: 'assets/MiRuta-CaG4Q2Cb.js', revision: null },
        { url: 'assets/MiBandeja-Bj5_XvVs.js', revision: null },
        { url: 'assets/logUpload-BP3nNfqm.js', revision: null },
        { url: 'assets/Login-BQp6o7ec.js', revision: null },
        { url: 'assets/LocationManager-DA2a6pZR.js', revision: null },
        { url: 'assets/Insumos-QsN2dJpd.js', revision: null },
        { url: 'assets/ingresarService-Du8UoVjb.js', revision: null },
        { url: 'assets/index-puW0B3h7.js', revision: null },
        { url: 'assets/index-D_mUoWvs.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CPX6bUW8.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-BdaoxQWw.js', revision: null },
        { url: 'assets/HistorialNV-DmAfnVif.js', revision: null },
        { url: 'assets/Heatmap-xlPXpNih.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Bu09zhoy.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-DyJztdJ2.js', revision: null },
        { url: 'assets/Entry-CECUA9oV.js', revision: null },
        { url: 'assets/DispatchControl-BWCWho9Q.js', revision: null },
        { url: 'assets/DataImport-C9Vqycg1.js', revision: null },
        { url: 'assets/dashData-IjtsrSpm.js', revision: null },
        { url: 'assets/DashboardReal-FUK4UOr7.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-DnwBfKhV.js', revision: null },
        { url: 'assets/conteoService-BNjBdZAi.js', revision: null },
        { url: 'assets/ConteoCiclico-DSX-rn7L.js', revision: null },
        { url: 'assets/ConsultaNV-D9H61Lxm.js', revision: null },
        { url: 'assets/ConsultaGrupo-haq7ylPC.js', revision: null },
        { url: 'assets/configService-DKdhO5Ue.js', revision: null },
        { url: 'assets/comunasChile-ms5t-HLq.js', revision: null },
        { url: 'assets/Cleanup-Bb9RW7ju.js', revision: null },
        { url: 'assets/ClasificacionProductos-CFiIVn-d.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-BUm5hh6X.js', revision: null },
        { url: 'assets/calidadService-B_XXUR0G.js', revision: null },
        { url: 'assets/CalidadBadge-DinbsB8I.js', revision: null },
        { url: 'assets/BodegasSoftland-CQVhIKOu.js', revision: null },
        { url: 'assets/BloqueDetalle-BvObkveN.js', revision: null },
        { url: 'assets/Batches-DZ2t-9bK.js', revision: null },
        { url: 'assets/ApiKeys-CP_H2VA-.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-5hqYu6q5.js', revision: null },
        { url: 'assets/AdminMonitor-DrSDmCBm.js', revision: null },
        { url: 'assets/Addresses-D1pn5aWs.js', revision: null },
        { url: 'assets/AccionIntegracion-BMw0gEYS.js', revision: null },
        { url: 'assets/AccionesCalidad-pJABSSfb.js', revision: null },
        { url: 'assets/AccessControl-Bbp-Ox9_.js', revision: null },
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
