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
        { url: 'index.html', revision: '83e75793f32a1ff1a510e8eca4143fad' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BhlZMcNA.js', revision: null },
        { url: 'assets/WmsLocations-7xrBvonw.js', revision: null },
        { url: 'assets/web-TkeF-Ko2.js', revision: null },
        { url: 'assets/web-CXnx1i2E.js', revision: null },
        { url: 'assets/web-Bq3NB3V9.js', revision: null },
        { url: 'assets/warehouseStore-G6Yrgp2w.js', revision: null },
        { url: 'assets/WarehousePDA-Fz4WqMeI.js', revision: null },
        { url: 'assets/Views-C-LONGb2.js', revision: null },
        { url: 'assets/vfs_fonts-5uhwfOEQ.js', revision: null },
        { url: 'assets/VerificarCertificado-NOSiqMHo.js', revision: null },
        { url: 'assets/useRealtimeTable-jM0EnCWy.js', revision: null },
        { url: 'assets/useBarcodeScanner-kMWze_Z_.js', revision: null },
        { url: 'assets/UploadHistory-B9Z5XsDq.js', revision: null },
        { url: 'assets/ui-vendor-D9BeWSwh.js', revision: null },
        { url: 'assets/TrazabilidadModal-Cd3lRNRD.js', revision: null },
        { url: 'assets/Traspasos-D2G_4Q0l.js', revision: null },
        { url: 'assets/Transporte-DSsPgvc9.js', revision: null },
        { url: 'assets/Tickets-BebZc5G4.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-D8jRYE_u.js', revision: null },
        { url: 'assets/SolicitudPublica-DW-s-x2e.js', revision: null },
        { url: 'assets/Seguridad-DuurMfET.js', revision: null },
        { url: 'assets/securityService-BlD-era_.js', revision: null },
        { url: 'assets/SalesStatus-CXVVuHPp.js', revision: null },
        { url: 'assets/ReceptionNacional-BrJsjzti.js', revision: null },
        { url: 'assets/Reception-9aZ570Bx.js', revision: null },
        { url: 'assets/react-vendor-CczoB5o5.js', revision: null },
        { url: 'assets/QueryErrorState-Cftbgbl3.js', revision: null },
        { url: 'assets/query-vendor-AW4268wa.js', revision: null },
        { url: 'assets/ProductDatasheet-CoW5_OnO.js', revision: null },
        { url: 'assets/Postventa-DsieCULB.js', revision: null },
        { url: 'assets/PodCapture-DsIHsjS2.js', revision: null },
        { url: 'assets/pickingStore-CuXBAwMi.js', revision: null },
        { url: 'assets/pdfmake-D8-GTQ7-.js', revision: null },
        { url: 'assets/PanelTVReal-BvjCa-oQ.js', revision: null },
        { url: 'assets/panelPtm-d_i1-_xv.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-D5WtoGs9.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BckJ1hLN.js', revision: null },
        { url: 'assets/PanelInfoReal-Bv11mci4.js', revision: null },
        { url: 'assets/PanelConfigReal-7l3gThSY.js', revision: null },
        { url: 'assets/PanelBuilderReal-DfNJloti.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-O3N9ePM1.js', revision: null },
        { url: 'assets/NotFound-DGiS7PMg.js', revision: null },
        { url: 'assets/Monitoreo-ylkKBXa1.js', revision: null },
        { url: 'assets/MiRuta-DOMmD0Iy.js', revision: null },
        { url: 'assets/MiBandeja-D8ztpKCX.js', revision: null },
        { url: 'assets/logUpload-BFE3F34W.js', revision: null },
        { url: 'assets/Login-D4Cpo5ij.js', revision: null },
        { url: 'assets/LocationManager-1C-mFYu-.js', revision: null },
        { url: 'assets/Insumos-15n9yB9Y.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-CRyr4FS8.js', revision: null },
        { url: 'assets/index-CKBQV3Ro.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BilZzKmM.js', revision: null },
        { url: 'assets/iamService-DV5jOZvd.js', revision: null },
        { url: 'assets/HistorialNV-CXtpX3Ax.js', revision: null },
        { url: 'assets/Heatmap-hSOtXNuh.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-BeEEpOKU.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-BNmSJ4fi.js', revision: null },
        { url: 'assets/Entry-CCleEjUV.js', revision: null },
        { url: 'assets/DispatchControl-CiEJzisS.js', revision: null },
        { url: 'assets/DataImport-BIFBVrfv.js', revision: null },
        { url: 'assets/dashData-CjpiJtgI.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-DbtJRN29.js', revision: null },
        { url: 'assets/CubingRegistry-qgzakYr9.js', revision: null },
        { url: 'assets/conteoService-DPFIGW2c.js', revision: null },
        { url: 'assets/ConteoCiclico-BGUuwmeH.js', revision: null },
        { url: 'assets/ConsultaNV-dWdt6QS1.js', revision: null },
        { url: 'assets/ConsultaGrupo-B0t_Foch.js', revision: null },
        { url: 'assets/configService-CLENAe1_.js', revision: null },
        { url: 'assets/comunasChile-DUBfklIR.js', revision: null },
        { url: 'assets/Cleanup-BZ_1yANK.js', revision: null },
        { url: 'assets/ClasificacionProductos-D_UdZ9mS.js', revision: null },
        { url: 'assets/charts-vendor-Bk5-SXWK.js', revision: null },
        { url: 'assets/Carteles-DglFVhlt.js', revision: null },
        { url: 'assets/calidadService-CcdGMVTK.js', revision: null },
        { url: 'assets/CalidadBadge-BOrmvuCA.js', revision: null },
        { url: 'assets/BodegasSoftland-CPFcV3NQ.js', revision: null },
        { url: 'assets/BloqueDetalle-BKhsSbqC.js', revision: null },
        { url: 'assets/Batches-LLQcM3rG.js', revision: null },
        { url: 'assets/ApiKeys-DuPY_aTp.js', revision: null },
        { url: 'assets/animation-vendor-Bm2mNA5x.js', revision: null },
        { url: 'assets/AnalisisCodigos-w7AS5jAr.js', revision: null },
        { url: 'assets/AdminMonitor-C5m2lhtu.js', revision: null },
        { url: 'assets/Addresses-Dcygp-lT.js', revision: null },
        { url: 'assets/AccionIntegracion-Bib74988.js', revision: null },
        { url: 'assets/AccionesCalidad-v6RsZu3W.js', revision: null },
        { url: 'assets/AccessControl-s0wieQgK.js', revision: null },
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
