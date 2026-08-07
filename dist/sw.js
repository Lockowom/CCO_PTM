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
        { url: 'index.html', revision: 'aeef6e611f5d9f852d5294730b351838' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BPqbiQQ1.js', revision: null },
        { url: 'assets/WmsLocations-eIp-lJ0g.js', revision: null },
        { url: 'assets/web-DwgXNApj.js', revision: null },
        { url: 'assets/web-CkHaphpC.js', revision: null },
        { url: 'assets/web-C0l_n2Vf.js', revision: null },
        { url: 'assets/warehouseStore-DNPrU-K3.js', revision: null },
        { url: 'assets/WarehousePDA-BOwyzySr.js', revision: null },
        { url: 'assets/Views-B8H3UhY7.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-V6G9r20U.js', revision: null },
        { url: 'assets/useRealtimeTable-BTsMHpNn.js', revision: null },
        { url: 'assets/useBarcodeScanner-BbrlPvS3.js', revision: null },
        { url: 'assets/UploadHistory-CK2amDjF.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-CvZyoLv_.js', revision: null },
        { url: 'assets/Traspasos-CrG2jbQE.js', revision: null },
        { url: 'assets/Transporte-Syx4DB5d.js', revision: null },
        { url: 'assets/Tickets-DtBqPoBT.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Bw00GqOT.js', revision: null },
        { url: 'assets/SolicitudPublica-BB7I46JL.js', revision: null },
        { url: 'assets/Seguridad-DCWxvOLU.js', revision: null },
        { url: 'assets/securityService-BUY0n1nl.js', revision: null },
        { url: 'assets/SalesStatus-BXU8lopX.js', revision: null },
        { url: 'assets/ReceptionNacional-D24lDrMg.js', revision: null },
        { url: 'assets/Reception-DZrQeRYB.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CD4CpTN2.js', revision: null },
        { url: 'assets/Postventa-BenDsNR2.js', revision: null },
        { url: 'assets/PodCapture-B4uC5FH2.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CxGrKqzh.js', revision: null },
        { url: 'assets/panelPtm-BOoEAF4f.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-Dn1Fe0sT.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-DHZEesd2.js', revision: null },
        { url: 'assets/PanelConfigReal-BiaHsAbF.js', revision: null },
        { url: 'assets/PanelBuilderReal-Dn_0_sO4.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-CMZBHs6D.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-BBRRk4Vr.js', revision: null },
        { url: 'assets/MiRuta-BNMm27Q8.js', revision: null },
        { url: 'assets/MiBandeja-B6-jk1cR.js', revision: null },
        { url: 'assets/logUpload-CirbzmMi.js', revision: null },
        { url: 'assets/Login-Fig6c6jy.js', revision: null },
        { url: 'assets/LocationManager-CctQmgxR.js', revision: null },
        { url: 'assets/Insumos-BHjvHUfD.js', revision: null },
        { url: 'assets/index-Pwuftu2X.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-D6KVA2Cg.js', revision: null },
        { url: 'assets/index-Cg-6XdaK.css', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-CNmN79Bl.js', revision: null },
        { url: 'assets/HistorialNV-B42Ts0nL.js', revision: null },
        { url: 'assets/Heatmap-DZS0p26d.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-CiiykJ7w.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-C5IROPmQ.js', revision: null },
        { url: 'assets/Entry-EyRI3UQg.js', revision: null },
        { url: 'assets/DispatchControl-CGGmEzMs.js', revision: null },
        { url: 'assets/DataImport-BPufjkDh.js', revision: null },
        { url: 'assets/dashData-CuHLGzGa.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BKJSJQO3.js', revision: null },
        { url: 'assets/CubingRegistry-CJX68oDF.js', revision: null },
        { url: 'assets/conteoService-ChRrRej9.js', revision: null },
        { url: 'assets/ConteoCiclico-_cu836Hy.js', revision: null },
        { url: 'assets/ConsultaNV-CjRSNKLZ.js', revision: null },
        { url: 'assets/ConsultaGrupo-DDB7Feg6.js', revision: null },
        { url: 'assets/configService-LsOmCemR.js', revision: null },
        { url: 'assets/comunasChile-C32wASQc.js', revision: null },
        { url: 'assets/Cleanup-ByNTwa6b.js', revision: null },
        { url: 'assets/ClasificacionProductos-CGSEicne.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-Bqf-CNwa.js', revision: null },
        { url: 'assets/calidadService-J_Dg-qKj.js', revision: null },
        { url: 'assets/CalidadBadge-BiQeYc4G.js', revision: null },
        { url: 'assets/BodegasSoftland-fhe69jdW.js', revision: null },
        { url: 'assets/BloqueDetalle-CaGWcnid.js', revision: null },
        { url: 'assets/Batches-ByS-mi1i.js', revision: null },
        { url: 'assets/ApiKeys-CvhQkCpu.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-9vu37I0U.js', revision: null },
        { url: 'assets/AdminMonitor-BxNSE4Tp.js', revision: null },
        { url: 'assets/Addresses-BrWMjJrV.js', revision: null },
        { url: 'assets/AccionIntegracion-xgCjM2Xu.js', revision: null },
        { url: 'assets/AccionesCalidad-DrgF7HoA.js', revision: null },
        { url: 'assets/AccessControl-BLKxgNlz.js', revision: null },
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
