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
        { url: 'index.html', revision: '983bdbea8cb8c3c480f123b5659a322a' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-B-QBIltV.js', revision: null },
        { url: 'assets/WmsLocations-D4gFiQQq.js', revision: null },
        { url: 'assets/web-Da-JLxpP.js', revision: null },
        { url: 'assets/web-CeaCoo9x.js', revision: null },
        { url: 'assets/web-C7BQQw7V.js', revision: null },
        { url: 'assets/warehouseStore-BSkE6PTv.js', revision: null },
        { url: 'assets/WarehousePDA-B6hktz0E.js', revision: null },
        { url: 'assets/Views-AmO6Ofkb.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-CAY6w4zI.js', revision: null },
        { url: 'assets/useRealtimeTable-DBLHh9Hj.js', revision: null },
        { url: 'assets/useBarcodeScanner-DfT3s84Y.js', revision: null },
        { url: 'assets/UploadHistory-CYtWEs_Z.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-JpEBHx8-.js', revision: null },
        { url: 'assets/Traspasos-DUOp6AND.js', revision: null },
        { url: 'assets/Transporte-BslNTPKg.js', revision: null },
        { url: 'assets/Tickets-CwAAPmvg.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BImfIR45.js', revision: null },
        { url: 'assets/SolicitudPublica-BhsROaLx.js', revision: null },
        { url: 'assets/Seguridad-BrQvXZY3.js', revision: null },
        { url: 'assets/securityService-BpHdAmoK.js', revision: null },
        { url: 'assets/SalesStatus-cvAK0AvH.js', revision: null },
        { url: 'assets/ReceptionNacional-BklKM3f0.js', revision: null },
        { url: 'assets/Reception-DUDwmutj.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-Ajy0LefC.js', revision: null },
        { url: 'assets/Postventa-C9EVCScT.js', revision: null },
        { url: 'assets/PodCapture-CO1kuPXY.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-DJMKt-ke.js', revision: null },
        { url: 'assets/panelPtm-BGVtSwxN.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BhYUM3uj.js', revision: null },
        { url: 'assets/PanelInfoReal-r4Uehnrl.js', revision: null },
        { url: 'assets/PanelConfigReal-zkSF5SXn.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-blQm4Qg9.js', revision: null },
        { url: 'assets/Observability-CQsrM_ih.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-BimQcydy.js', revision: null },
        { url: 'assets/MiRuta-CqdGmfUF.js', revision: null },
        { url: 'assets/MiBandeja-xYl8pF25.js', revision: null },
        { url: 'assets/logUpload-IipokB6L.js', revision: null },
        { url: 'assets/Login-CbE4hSZJ.js', revision: null },
        { url: 'assets/LocationManager-lOAIRYJk.js', revision: null },
        { url: 'assets/Insumos-C5JV7U6Q.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-DAO1fX38.js', revision: null },
        { url: 'assets/index-CGxhzXhh.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-1Y0iezFM.js', revision: null },
        { url: 'assets/HistorialNV-Bhtym6zb.js', revision: null },
        { url: 'assets/Heatmap-DKF5RFWC.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Cy2KFVlE.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-C-ucvqqn.js', revision: null },
        { url: 'assets/Entry-545egrEy.js', revision: null },
        { url: 'assets/DispatchControl-D9q4b9vw.js', revision: null },
        { url: 'assets/DataImport-DEkLsXIU.js', revision: null },
        { url: 'assets/dashData-DQKNFjc8.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BpekipJX.js', revision: null },
        { url: 'assets/CubingRegistry-MCVSkV-R.js', revision: null },
        { url: 'assets/conteoService-BqEG8gbR.js', revision: null },
        { url: 'assets/ConteoCiclico-BSVEpO8D.js', revision: null },
        { url: 'assets/ConsultaNV-kWtGk04N.js', revision: null },
        { url: 'assets/ConsultaGrupo-Cj5W7Aix.js', revision: null },
        { url: 'assets/configService-D21XvtZH.js', revision: null },
        { url: 'assets/comunasChile-T1lVWovE.js', revision: null },
        { url: 'assets/Cleanup-DGKx8TMx.js', revision: null },
        { url: 'assets/ClasificacionProductos-NpOkBb6j.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-BSzoyM0U.js', revision: null },
        { url: 'assets/calidadService-4URiAnPi.js', revision: null },
        { url: 'assets/CalidadBadge-gi4ftrid.js', revision: null },
        { url: 'assets/BodegasSoftland-C_Jh4j4z.js', revision: null },
        { url: 'assets/BloqueDetalle-JupivG4A.js', revision: null },
        { url: 'assets/Batches-BYWDSeWG.js', revision: null },
        { url: 'assets/ApiKeys-Z72FwQqm.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DvgWX0vg.js', revision: null },
        { url: 'assets/AdminMonitor-Be-fKv8F.js', revision: null },
        { url: 'assets/Addresses-D1U7M6Gb.js', revision: null },
        { url: 'assets/AccionIntegracion-Z4rIddmt.js', revision: null },
        { url: 'assets/AccionesCalidad-BcJR0Jnx.js', revision: null },
        { url: 'assets/AccessControl-kmLqkQfL.js', revision: null },
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
