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
        { url: 'index.html', revision: 'd9234e1b977a05c6d9aa20fee0bafeb2' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DzRps1rw.js', revision: null },
        { url: 'assets/WmsLocations-DG_4dIbI.js', revision: null },
        { url: 'assets/web-uOx-xjH4.js', revision: null },
        { url: 'assets/web-BjmIfo2d.js', revision: null },
        { url: 'assets/web-52X3s0XY.js', revision: null },
        { url: 'assets/warehouseStore-BmofVMh0.js', revision: null },
        { url: 'assets/WarehousePDA-De6XGtKL.js', revision: null },
        { url: 'assets/Views-CqMZmtej.js', revision: null },
        { url: 'assets/vfs_fonts-C24r0ruI.js', revision: null },
        { url: 'assets/VerificarCertificado-CYUQ4khW.js', revision: null },
        { url: 'assets/useRealtimeTable-qFXHl6ee.js', revision: null },
        { url: 'assets/useBarcodeScanner-Dfikr0QI.js', revision: null },
        { url: 'assets/UploadHistory-hhi2pjoB.js', revision: null },
        { url: 'assets/ui-vendor-D-9zQVt7.js', revision: null },
        { url: 'assets/TrazabilidadModal-Cx0kexAW.js', revision: null },
        { url: 'assets/Traspasos-ComIn7-h.js', revision: null },
        { url: 'assets/Transporte-CcQnfYC4.js', revision: null },
        { url: 'assets/Tickets-Cu4-4xOe.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-B5Uz2KQb.js', revision: null },
        { url: 'assets/SolicitudPublica-CZZ8njFr.js', revision: null },
        { url: 'assets/Seguridad-Bd-BVPwT.js', revision: null },
        { url: 'assets/securityService-Zf3YRYx0.js', revision: null },
        { url: 'assets/SalesStatus-C-WqLFg8.js', revision: null },
        { url: 'assets/ReceptionNacional-CCBVUI5j.js', revision: null },
        { url: 'assets/Reception-CdOHCW5z.js', revision: null },
        { url: 'assets/react-vendor-C8fdn38R.js', revision: null },
        { url: 'assets/QueryErrorState-Ca2nvJNI.js', revision: null },
        { url: 'assets/query-vendor-B1MP_4YJ.js', revision: null },
        { url: 'assets/ProductDatasheet-6tCNRz1b.js', revision: null },
        { url: 'assets/Postventa-CC_sG0iq.js', revision: null },
        { url: 'assets/PodCapture-B5LRlKlc.js', revision: null },
        { url: 'assets/pickingStore-B6NG5l76.js', revision: null },
        { url: 'assets/pdfmake-BwwREtpy.js', revision: null },
        { url: 'assets/PanelTVReal-CYwNBZuS.js', revision: null },
        { url: 'assets/panelPtm-CO0vc8gV.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BrWHiqAA.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-Bkvi5Eoy.js', revision: null },
        { url: 'assets/PanelInfoReal-CK9NzDsP.js', revision: null },
        { url: 'assets/PanelConfigReal-B8g1UxAT.js', revision: null },
        { url: 'assets/PanelBuilderReal-CQ7eoBty.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-Dm3VyRBE.js', revision: null },
        { url: 'assets/NotFound-3sCqnTFJ.js', revision: null },
        { url: 'assets/Monitoreo-D1rbuII6.js', revision: null },
        { url: 'assets/MiRuta-BryLKpXc.js', revision: null },
        { url: 'assets/MiBandeja-CLJtnn6G.js', revision: null },
        { url: 'assets/logUpload-BGFBP96J.js', revision: null },
        { url: 'assets/Login-D2Oe4KYt.js', revision: null },
        { url: 'assets/LocationManager-DBqGpVt2.js', revision: null },
        { url: 'assets/Insumos-KHZHFZJ5.js', revision: null },
        { url: 'assets/index-OhPXt-QH.js', revision: null },
        { url: 'assets/index-DsXGZokt.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-CXYp_lIK.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/iamService-DtXEp275.js', revision: null },
        { url: 'assets/HistorialNV-DCrllbKI.js', revision: null },
        { url: 'assets/Heatmap-R65fu6kj.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-CZYLYT9p.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-C3bPUmL4.js', revision: null },
        { url: 'assets/Entry--aFrV7vc.js', revision: null },
        { url: 'assets/DispatchControl-B-u6GuDO.js', revision: null },
        { url: 'assets/DataImport-DOYSvRFn.js', revision: null },
        { url: 'assets/dashData-BFh40pKf.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-D0oHgXTy.js', revision: null },
        { url: 'assets/CubingRegistry-CW1jzI5s.js', revision: null },
        { url: 'assets/conteoService-BAfPXDAE.js', revision: null },
        { url: 'assets/ConteoCiclico-Bn4lxKoo.js', revision: null },
        { url: 'assets/ConsultaNV-DJ-ol2O2.js', revision: null },
        { url: 'assets/ConsultaGrupo-Bah6C8Jm.js', revision: null },
        { url: 'assets/configService-BXDVDtfm.js', revision: null },
        { url: 'assets/comunasChile-esE9Em0q.js', revision: null },
        { url: 'assets/Cleanup-CMQiwpcm.js', revision: null },
        { url: 'assets/ClasificacionProductos-Czn2aBJC.js', revision: null },
        { url: 'assets/charts-vendor-BPHLCusR.js', revision: null },
        { url: 'assets/Carteles-DqhE0_sr.js', revision: null },
        { url: 'assets/calidadService-D6aoCeyP.js', revision: null },
        { url: 'assets/CalidadBadge-Db7TD1hJ.js', revision: null },
        { url: 'assets/BodegasSoftland-C8bgrk6b.js', revision: null },
        { url: 'assets/BloqueDetalle-ByH-Vpc7.js', revision: null },
        { url: 'assets/Batches-BMwjyOCA.js', revision: null },
        { url: 'assets/ApiKeys-Cfl6N8rs.js', revision: null },
        { url: 'assets/animation-vendor-BwUUObbT.js', revision: null },
        { url: 'assets/AnalisisCodigos-BgGVHtmd.js', revision: null },
        { url: 'assets/AdminMonitor-C6FX1QcE.js', revision: null },
        { url: 'assets/Addresses-B1iXKQwC.js', revision: null },
        { url: 'assets/AccionIntegracion-3oQOTiX1.js', revision: null },
        { url: 'assets/AccionesCalidad-BIhCe_jx.js', revision: null },
        { url: 'assets/AccessControl-PNP9HRAp.js', revision: null },
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
