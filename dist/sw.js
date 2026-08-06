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
        { url: 'index.html', revision: '4136caf7a964dc1bf30ddde629a1046d' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-9tjdW5rT.js', revision: null },
        { url: 'assets/WmsLocations-BlwomgmB.js', revision: null },
        { url: 'assets/web-BEtFXz4K.js', revision: null },
        { url: 'assets/web-50HD2j9O.js', revision: null },
        { url: 'assets/web--JstTkg7.js', revision: null },
        { url: 'assets/warehouseStore-BqMbGT2A.js', revision: null },
        { url: 'assets/WarehousePDA-D02u4ihv.js', revision: null },
        { url: 'assets/Views-DL1GqiTs.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-WwRvqs_P.js', revision: null },
        { url: 'assets/useRealtimeTable-Rzukdp1R.js', revision: null },
        { url: 'assets/useBarcodeScanner-BganZ5ep.js', revision: null },
        { url: 'assets/UploadHistory-DD38BwSn.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-D5_o_6U2.js', revision: null },
        { url: 'assets/Traspasos-CZdglFFW.js', revision: null },
        { url: 'assets/Transporte-CWj4NzDu.js', revision: null },
        { url: 'assets/Tickets-nofKfKGA.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-CFoJh60j.js', revision: null },
        { url: 'assets/SolicitudPublica-Ba_UM44Z.js', revision: null },
        { url: 'assets/Seguridad-D1L4-W6K.js', revision: null },
        { url: 'assets/securityService-CoKS3GWK.js', revision: null },
        { url: 'assets/SalesStatus-BhXYyWwl.js', revision: null },
        { url: 'assets/ReceptionNacional-DFOVXIoR.js', revision: null },
        { url: 'assets/Reception-DXtt2nrA.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-Cn2WjX2i.js', revision: null },
        { url: 'assets/Postventa-xydmIjYS.js', revision: null },
        { url: 'assets/PodCapture-C7XDHyFp.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-DhZ8ZC_o.js', revision: null },
        { url: 'assets/panelPtm-nVssE702.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BI-lZ67w.js', revision: null },
        { url: 'assets/PanelInfoReal-CSrEFrrE.js', revision: null },
        { url: 'assets/PanelConfigReal-BSw6CpsW.js', revision: null },
        { url: 'assets/PanelBuilderReal-CnLzuxd6.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-jYXGyjoh.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-DZLoSkFY.js', revision: null },
        { url: 'assets/MiRuta-CRVvwEdY.js', revision: null },
        { url: 'assets/MiBandeja-B-lnhL9w.js', revision: null },
        { url: 'assets/logUpload-CecXevRB.js', revision: null },
        { url: 'assets/Login-DC9oMQt4.js', revision: null },
        { url: 'assets/LocationManager-DbzjVmm3.js', revision: null },
        { url: 'assets/Insumos-BMmive7b.js', revision: null },
        { url: 'assets/index-fTCu8lww.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-Cg-6XdaK.css', revision: null },
        { url: 'assets/index-BSnpYyAh.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-DOBvH-c9.js', revision: null },
        { url: 'assets/HistorialNV-CMjK5Nyj.js', revision: null },
        { url: 'assets/Heatmap-DM1e2TOK.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-C9buOeQq.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-DhQgdqhl.js', revision: null },
        { url: 'assets/Entry-Tjc1FEZF.js', revision: null },
        { url: 'assets/DispatchControl-DeAzW7JL.js', revision: null },
        { url: 'assets/DataImport-CLBygvAr.js', revision: null },
        { url: 'assets/dashData-BOFEwnjS.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-DcWf3Cfp.js', revision: null },
        { url: 'assets/CubingRegistry-BrknBRe7.js', revision: null },
        { url: 'assets/conteoService-SIY8Tvfr.js', revision: null },
        { url: 'assets/ConteoCiclico-Bc7d3DxT.js', revision: null },
        { url: 'assets/ConsultaNV-QPc9UVAH.js', revision: null },
        { url: 'assets/ConsultaGrupo-Cu3GEiz6.js', revision: null },
        { url: 'assets/configService-BHU6BKp0.js', revision: null },
        { url: 'assets/comunasChile-D87fLc2S.js', revision: null },
        { url: 'assets/Cleanup-CF1R7XDO.js', revision: null },
        { url: 'assets/ClasificacionProductos-Dqvnltce.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-BJBmSm6d.js', revision: null },
        { url: 'assets/calidadService-CtLsnG2l.js', revision: null },
        { url: 'assets/CalidadBadge-BiuG-y8u.js', revision: null },
        { url: 'assets/BodegasSoftland-F50r2IQR.js', revision: null },
        { url: 'assets/BloqueDetalle-C9mWtVik.js', revision: null },
        { url: 'assets/Batches-CQgdMCDi.js', revision: null },
        { url: 'assets/ApiKeys-CSi6m-jj.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DhBFZY2X.js', revision: null },
        { url: 'assets/AdminMonitor-0blBs8hv.js', revision: null },
        { url: 'assets/Addresses-WkIgPe0R.js', revision: null },
        { url: 'assets/AccionIntegracion-DgHf-yM6.js', revision: null },
        { url: 'assets/AccionesCalidad-Bbh1Dars.js', revision: null },
        { url: 'assets/AccessControl-CHj2HjGA.js', revision: null },
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
