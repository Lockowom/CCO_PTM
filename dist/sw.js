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
        { url: 'index.html', revision: 'fd3c77a65eeef334618c4882cead64bd' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DiS15z2S.js', revision: null },
        { url: 'assets/WmsLocations-DDdeZ0Sy.js', revision: null },
        { url: 'assets/web-DB-eE-IX.js', revision: null },
        { url: 'assets/web-CiGrcI6Y.js', revision: null },
        { url: 'assets/web-C4nWDRle.js', revision: null },
        { url: 'assets/warehouseStore-DJlDq0o_.js', revision: null },
        { url: 'assets/WarehousePDA-CVxOvEPu.js', revision: null },
        { url: 'assets/Views-V6iUkzf6.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-Tlk-Eqbq.js', revision: null },
        { url: 'assets/useRealtimeTable-b3KxCJmx.js', revision: null },
        { url: 'assets/useBarcodeScanner-MlqgQ6gN.js', revision: null },
        { url: 'assets/UploadHistory-DeNuf5ky.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-CMxLnVFl.js', revision: null },
        { url: 'assets/Traspasos-CcphMGz0.js', revision: null },
        { url: 'assets/Transporte-C_8REYEe.js', revision: null },
        { url: 'assets/Tickets-Dfreyo-Y.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Bn_rj096.js', revision: null },
        { url: 'assets/SolicitudPublica-Du2kHRgl.js', revision: null },
        { url: 'assets/Seguridad-Cu6-Msjl.js', revision: null },
        { url: 'assets/securityService-CAaZpJ2Y.js', revision: null },
        { url: 'assets/SalesStatus-BpWFjE_4.js', revision: null },
        { url: 'assets/ReceptionNacional-C77g-WjT.js', revision: null },
        { url: 'assets/Reception-CfTUrX59.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CZubt7H_.js', revision: null },
        { url: 'assets/Postventa-59e3IcG-.js', revision: null },
        { url: 'assets/PodCapture-DPi6Pkpf.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-e7g_K6wP.js', revision: null },
        { url: 'assets/panelPtm-1NSDiKbX.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar--J0NPb3-.js', revision: null },
        { url: 'assets/PanelInfoReal-CeTmLMBf.js', revision: null },
        { url: 'assets/PanelConfigReal-hmCTXigX.js', revision: null },
        { url: 'assets/PanelBuilderReal-DUcSyVkN.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-CfHKrBui.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-D6TD9kF3.js', revision: null },
        { url: 'assets/MiRuta-CZJrIz19.js', revision: null },
        { url: 'assets/MiBandeja-DJYv3Pw5.js', revision: null },
        { url: 'assets/logUpload-C3xXwLLN.js', revision: null },
        { url: 'assets/Login-B5E8F1Ny.js', revision: null },
        { url: 'assets/LocationManager-BZinKoHy.js', revision: null },
        { url: 'assets/Insumos-CeJh8FOd.js', revision: null },
        { url: 'assets/ingresarService-BdJ6SRhY.js', revision: null },
        { url: 'assets/index-DnqRwzS1.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-Cg-6XdaK.css', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BcUQjinW.js', revision: null },
        { url: 'assets/iamService-DxEz8FIB.js', revision: null },
        { url: 'assets/HistorialNV-Bw_xcR4G.js', revision: null },
        { url: 'assets/Heatmap-CcMp51d7.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-M0IAwtWk.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-C05TUw2m.js', revision: null },
        { url: 'assets/Entry-52UV0rjJ.js', revision: null },
        { url: 'assets/DispatchControl-Cd0OKL9C.js', revision: null },
        { url: 'assets/DataImport-mPPufwFf.js', revision: null },
        { url: 'assets/dashData-dIJXInRv.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-B9MGbgsg.js', revision: null },
        { url: 'assets/CubingRegistry-DDUvXszm.js', revision: null },
        { url: 'assets/conteoService-ofVsesdY.js', revision: null },
        { url: 'assets/ConteoCiclico-BmhWuvcd.js', revision: null },
        { url: 'assets/ConsultaNV-Dijsx8Ec.js', revision: null },
        { url: 'assets/ConsultaGrupo-B86CpKgA.js', revision: null },
        { url: 'assets/configService-C_Vbo58S.js', revision: null },
        { url: 'assets/comunasChile-Bax2nIS4.js', revision: null },
        { url: 'assets/Cleanup-CPDJ2RnA.js', revision: null },
        { url: 'assets/ClasificacionProductos-B5VCo9ET.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DbV7b5n4.js', revision: null },
        { url: 'assets/calidadService-Bhstt61n.js', revision: null },
        { url: 'assets/CalidadBadge-BdOtMw8i.js', revision: null },
        { url: 'assets/BodegasSoftland-Bk0MSDrA.js', revision: null },
        { url: 'assets/BloqueDetalle-DA-kOl4a.js', revision: null },
        { url: 'assets/Batches-CGeVomCy.js', revision: null },
        { url: 'assets/ApiKeys-yikBJBfg.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-CiDydQPV.js', revision: null },
        { url: 'assets/AdminMonitor-7TO6NyHo.js', revision: null },
        { url: 'assets/Addresses-CtqMVPBX.js', revision: null },
        { url: 'assets/AccionIntegracion-C3-_XSV8.js', revision: null },
        { url: 'assets/AccionesCalidad-D0U0YAfg.js', revision: null },
        { url: 'assets/AccessControl-C2b_32pu.js', revision: null },
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
