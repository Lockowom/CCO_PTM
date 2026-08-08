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
  self.define = (n, r) => {
    const i = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[i]) return;
    let u = {};
    const a = (s) => l(s, i),
      o = { module: { uri: i }, exports: u, require: a };
    e[i] = Promise.all(n.map((s) => o[s] || a(s))).then((s) => (r(...s), u));
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
        { url: 'index.html', revision: 'd7ae45958dd000b7660fe59ce5f87670' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BJakpX_b.js', revision: null },
        { url: 'assets/WmsLocations-BSGl_D5l.js', revision: null },
        { url: 'assets/web-CqmDoPwg.js', revision: null },
        { url: 'assets/web-C62pypaR.js', revision: null },
        { url: 'assets/web-B0ZUTF2m.js', revision: null },
        { url: 'assets/warehouseStore-CRrll_l0.js', revision: null },
        { url: 'assets/WarehousePDA-DoVffKgb.js', revision: null },
        { url: 'assets/Views-BoG0hxDR.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-DUMO-muG.js', revision: null },
        { url: 'assets/useRealtimeTable-BM5OD2k2.js', revision: null },
        { url: 'assets/useBarcodeScanner-BGBp-ebM.js', revision: null },
        { url: 'assets/UploadHistory-CfTKUudj.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-CU9G-b00.js', revision: null },
        { url: 'assets/Traspasos-G0oQvzog.js', revision: null },
        { url: 'assets/Transporte-BAOoSkBW.js', revision: null },
        { url: 'assets/Tickets-DZa_rIru.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BVww3Jga.js', revision: null },
        { url: 'assets/SolicitudPublica-XorJV32P.js', revision: null },
        { url: 'assets/Seguridad-fDnB_0EX.js', revision: null },
        { url: 'assets/securityService-Czfs_wjK.js', revision: null },
        { url: 'assets/SalesStatus-Chy7lyOf.js', revision: null },
        { url: 'assets/ReceptionNacional-B7N3cw7i.js', revision: null },
        { url: 'assets/Reception-DTWynV9n.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-rj6IYhBV.js', revision: null },
        { url: 'assets/Postventa-iPVCPO8X.js', revision: null },
        { url: 'assets/PodCapture-B3Mn5RyU.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal--A2kNwSD.js', revision: null },
        { url: 'assets/panelPtm-DM6iM8XS.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-DqtqSe2u.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-CTgWbuz1.js', revision: null },
        { url: 'assets/PanelConfigReal-BFUTS8zB.js', revision: null },
        { url: 'assets/PanelBuilderReal-D_iIQM6h.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-DebSbnJD.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-CJCP4Y3s.js', revision: null },
        { url: 'assets/MiRuta-Zvy47TPh.js', revision: null },
        { url: 'assets/MiBandeja-CiuMZh3p.js', revision: null },
        { url: 'assets/logUpload-D2llOReA.js', revision: null },
        { url: 'assets/Login-JXymO-uh.js', revision: null },
        { url: 'assets/LocationManager-Dr92ak-e.js', revision: null },
        { url: 'assets/Insumos-CqNfINrz.js', revision: null },
        { url: 'assets/ingresarService-be4gCB8U.js', revision: null },
        { url: 'assets/index-DSA4xH6T.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-DC1UTG7q.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-3Vq5tx7R.js', revision: null },
        { url: 'assets/iamService-Dej8as7H.js', revision: null },
        { url: 'assets/HistorialNV-BNFYnF3r.js', revision: null },
        { url: 'assets/Heatmap-8eUy6_4C.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Dh9DABha.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-phBDhBEj.js', revision: null },
        { url: 'assets/Entry-BR8KUvEX.js', revision: null },
        { url: 'assets/DispatchControl-CAonmCNq.js', revision: null },
        { url: 'assets/DataImport-PTF6Fr8K.js', revision: null },
        { url: 'assets/dashData-ELdxu4OM.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-BLpzrrW6.js', revision: null },
        { url: 'assets/CubingRegistry-D0V7l7s7.js', revision: null },
        { url: 'assets/conteoService-DbW1VIZj.js', revision: null },
        { url: 'assets/ConteoCiclico-CskBvWW3.js', revision: null },
        { url: 'assets/ConsultaNV-D0joG1Js.js', revision: null },
        { url: 'assets/ConsultaGrupo-WBuHceGa.js', revision: null },
        { url: 'assets/configService-B97lWQD8.js', revision: null },
        { url: 'assets/comunasChile-CcgnXYEm.js', revision: null },
        { url: 'assets/Cleanup-DtNCvzYC.js', revision: null },
        { url: 'assets/ClasificacionProductos-gQ0XPWGe.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DAc_rne5.js', revision: null },
        { url: 'assets/calidadService-CDHQqdvj.js', revision: null },
        { url: 'assets/CalidadBadge-r9N1P8h0.js', revision: null },
        { url: 'assets/BodegasSoftland-Bf5p-Vly.js', revision: null },
        { url: 'assets/BloqueDetalle-BvO60odG.js', revision: null },
        { url: 'assets/Batches-CHyYFJee.js', revision: null },
        { url: 'assets/ApiKeys-B4fjvqhJ.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-n7xl6IH4.js', revision: null },
        { url: 'assets/AdminMonitor--DeZusXg.js', revision: null },
        { url: 'assets/Addresses-CswHXlGK.js', revision: null },
        { url: 'assets/AccionIntegracion-AlG5IQkj.js', revision: null },
        { url: 'assets/AccionesCalidad-oGRTaF7N.js', revision: null },
        { url: 'assets/AccessControl-BhwAc3Dm.js', revision: null },
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
