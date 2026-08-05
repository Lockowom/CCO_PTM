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
        { url: 'index.html', revision: 'cb2a578069909c9fe7eddca3171b81b7' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-MKZSNAfX.js', revision: null },
        { url: 'assets/WmsLocations-DnifQ10s.js', revision: null },
        { url: 'assets/web-Dpxd2T6F.js', revision: null },
        { url: 'assets/web-CvgX52wO.js', revision: null },
        { url: 'assets/web-CmUzQ82K.js', revision: null },
        { url: 'assets/warehouseStore-BJj2xS2T.js', revision: null },
        { url: 'assets/WarehousePDA-C4QhTsts.js', revision: null },
        { url: 'assets/Views-CmsvBv9S.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-DjbMD_QJ.js', revision: null },
        { url: 'assets/useRealtimeTable-ZAlkDSid.js', revision: null },
        { url: 'assets/useBarcodeScanner-B2KQmUyU.js', revision: null },
        { url: 'assets/UploadHistory-20Z_X4XK.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-DYvvnHPT.js', revision: null },
        { url: 'assets/Traspasos-BeiadeX0.js', revision: null },
        { url: 'assets/Transporte-KNhG8wER.js', revision: null },
        { url: 'assets/Tickets-B186UXCs.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-DoP5csYG.js', revision: null },
        { url: 'assets/SolicitudPublica-thAf19a-.js', revision: null },
        { url: 'assets/Seguridad-ss3rSbXw.js', revision: null },
        { url: 'assets/securityService-DmhWdqGx.js', revision: null },
        { url: 'assets/SalesStatus-25gT7VDd.js', revision: null },
        { url: 'assets/ReceptionNacional-6zm6VegM.js', revision: null },
        { url: 'assets/Reception-CKWbhIFk.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-DGfQ7hEJ.js', revision: null },
        { url: 'assets/Postventa-Rh-1n6_I.js', revision: null },
        { url: 'assets/PodCapture-czDR_Cki.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-P2AxYaJv.js', revision: null },
        { url: 'assets/panelPtm-FtYu8-1D.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-DGyHiqQe.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-ozUdQ6dY.js', revision: null },
        { url: 'assets/PanelConfigReal-DV1JzDhJ.js', revision: null },
        { url: 'assets/PanelBuilderReal-CvyTneqJ.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-BNM8P6JJ.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-B_xH_o5x.js', revision: null },
        { url: 'assets/MiRuta-CgiNYwx8.js', revision: null },
        { url: 'assets/MiBandeja-Beee7caI.js', revision: null },
        { url: 'assets/logUpload-mTUGzvg7.js', revision: null },
        { url: 'assets/Login-CgHILohv.js', revision: null },
        { url: 'assets/LocationManager-DmphKjvr.js', revision: null },
        { url: 'assets/Insumos-zAGMokbJ.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-C4unXJmp.js', revision: null },
        { url: 'assets/index-BOgf3xmh.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-CamMWnuS.js', revision: null },
        { url: 'assets/HistorialNV-CM5kKw96.js', revision: null },
        { url: 'assets/Heatmap-CYpsCXYf.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DRdP7fFR.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-Cf6FILKW.js', revision: null },
        { url: 'assets/Entry-MnxTf84K.js', revision: null },
        { url: 'assets/DispatchControl-DHJ8omy-.js', revision: null },
        { url: 'assets/DataImport-C-ixJLvp.js', revision: null },
        { url: 'assets/dashData-CiNLJTeR.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CO6iAfpT.js', revision: null },
        { url: 'assets/CubingRegistry-DNveiP31.js', revision: null },
        { url: 'assets/conteoService-Cn_UCaMX.js', revision: null },
        { url: 'assets/ConteoCiclico-C89RCwhZ.js', revision: null },
        { url: 'assets/ConsultaNV-BU4q2WoX.js', revision: null },
        { url: 'assets/ConsultaGrupo-BfUl31mx.js', revision: null },
        { url: 'assets/configService-BHYk7m0u.js', revision: null },
        { url: 'assets/comunasChile-D-mK6qJI.js', revision: null },
        { url: 'assets/Cleanup-CJl6XUKH.js', revision: null },
        { url: 'assets/ClasificacionProductos-BV7_LKck.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-DdIz2mBB.js', revision: null },
        { url: 'assets/calidadService-DKsWhgj7.js', revision: null },
        { url: 'assets/CalidadBadge-Dqgqyxy5.js', revision: null },
        { url: 'assets/BodegasSoftland-BoJFHz_4.js', revision: null },
        { url: 'assets/BloqueDetalle-DmsMaRFV.js', revision: null },
        { url: 'assets/Batches-BSToO8m-.js', revision: null },
        { url: 'assets/ApiKeys-5yp7NBKI.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-BiQMofuB.js', revision: null },
        { url: 'assets/AdminMonitor-DUf283Bv.js', revision: null },
        { url: 'assets/Addresses-CV5st_S9.js', revision: null },
        { url: 'assets/AccionIntegracion-ngOcnF6a.js', revision: null },
        { url: 'assets/AccionesCalidad-CkCTj0IP.js', revision: null },
        { url: 'assets/AccessControl-Bd9J3bp_.js', revision: null },
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
