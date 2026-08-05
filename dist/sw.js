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
        { url: 'index.html', revision: 'd6c8a6ac4214263990e900d09b5293ba' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-Dxzg8C_L.js', revision: null },
        { url: 'assets/WmsLocations-CSWVYncM.js', revision: null },
        { url: 'assets/web-HKc-DTmf.js', revision: null },
        { url: 'assets/web-CwFCA7cH.js', revision: null },
        { url: 'assets/web-CoUON1PG.js', revision: null },
        { url: 'assets/warehouseStore-CRb3RPHH.js', revision: null },
        { url: 'assets/WarehousePDA-Ctctutz5.js', revision: null },
        { url: 'assets/Views-U0BnFuyk.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-D9SJ6Xn3.js', revision: null },
        { url: 'assets/useRealtimeTable-Dy1UENmS.js', revision: null },
        { url: 'assets/useBarcodeScanner-Coq_7eXN.js', revision: null },
        { url: 'assets/UploadHistory-B64KHPkp.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-DJicWaC8.js', revision: null },
        { url: 'assets/Traspasos-BGYvODF5.js', revision: null },
        { url: 'assets/Transporte-0kmFgncM.js', revision: null },
        { url: 'assets/Tickets-DIOINRn5.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Dsp5eO-V.js', revision: null },
        { url: 'assets/SolicitudPublica-CzUvQosM.js', revision: null },
        { url: 'assets/Seguridad-Cinmv-BC.js', revision: null },
        { url: 'assets/securityService-Clu4xdgm.js', revision: null },
        { url: 'assets/SalesStatus-CkzKiLHc.js', revision: null },
        { url: 'assets/ReceptionNacional-vaXabHkf.js', revision: null },
        { url: 'assets/Reception-DmTM9DxL.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CW5zLpmS.js', revision: null },
        { url: 'assets/Postventa-Df9ZpGHI.js', revision: null },
        { url: 'assets/PodCapture-Dpr0j-I3.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CLVRz4A-.js', revision: null },
        { url: 'assets/panelPtm-CDnLWza1.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-B2fesFI9.js', revision: null },
        { url: 'assets/PanelInfoReal-kNy4dy5I.js', revision: null },
        { url: 'assets/PanelConfigReal-CamWUiJ7.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-BoehQ7uj.js', revision: null },
        { url: 'assets/Observability-DpijaFrx.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-BprAzTn9.js', revision: null },
        { url: 'assets/MiRuta-CI9oGxR7.js', revision: null },
        { url: 'assets/MiBandeja-Co7ow826.js', revision: null },
        { url: 'assets/logUpload-BMdJP8Nw.js', revision: null },
        { url: 'assets/Login-CMTtx1rP.js', revision: null },
        { url: 'assets/LocationManager-sxApm1Kr.js', revision: null },
        { url: 'assets/Insumos-RPOSDZq2.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CaJXm3gm.js', revision: null },
        { url: 'assets/index-C6EyMClL.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-B57iRPXu.js', revision: null },
        { url: 'assets/HistorialNV-Di-ZETJV.js', revision: null },
        { url: 'assets/Heatmap-ChJ50DNq.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Csh7jRpn.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-DN-uY66A.js', revision: null },
        { url: 'assets/Entry-IM5arCqH.js', revision: null },
        { url: 'assets/DispatchControl-BVdIAYrl.js', revision: null },
        { url: 'assets/DataImport-DR0XLXh4.js', revision: null },
        { url: 'assets/dashData-DlCYxS6f.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CP5Bcb0v.js', revision: null },
        { url: 'assets/CubingRegistry-P21POIO5.js', revision: null },
        { url: 'assets/conteoService-CuWlHYrY.js', revision: null },
        { url: 'assets/ConteoCiclico-DdtkMx46.js', revision: null },
        { url: 'assets/ConsultaNV-OlRIXzfG.js', revision: null },
        { url: 'assets/ConsultaGrupo-CV2wGi4k.js', revision: null },
        { url: 'assets/configService-BfepcOg6.js', revision: null },
        { url: 'assets/comunasChile-CWFdA35L.js', revision: null },
        { url: 'assets/Cleanup-Da7QdHVS.js', revision: null },
        { url: 'assets/ClasificacionProductos-D-t6Byqh.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DXJCiL_T.js', revision: null },
        { url: 'assets/calidadService-P4DbxwWM.js', revision: null },
        { url: 'assets/CalidadBadge-B9bThnqk.js', revision: null },
        { url: 'assets/BodegasSoftland-aFZjBrsM.js', revision: null },
        { url: 'assets/BloqueDetalle-C1f5wsK5.js', revision: null },
        { url: 'assets/Batches-BhOILRT8.js', revision: null },
        { url: 'assets/ApiKeys-ekRU5bwy.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-CYwRIt5N.js', revision: null },
        { url: 'assets/AdminMonitor-vvKYfX5q.js', revision: null },
        { url: 'assets/Addresses-C_YF3vCd.js', revision: null },
        { url: 'assets/AccionIntegracion-BNXMpiVF.js', revision: null },
        { url: 'assets/AccionesCalidad-DSVqMf9v.js', revision: null },
        { url: 'assets/AccessControl-DvnTfDlC.js', revision: null },
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
