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
        { url: 'index.html', revision: '0b2b49e90db2ab6926122f3671620b42' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-BJuVWkUV.js', revision: null },
        { url: 'assets/WmsLocations-BWl9PmK7.js', revision: null },
        { url: 'assets/web-Dis6CgrU.js', revision: null },
        { url: 'assets/web-CX1-ladS.js', revision: null },
        { url: 'assets/web-C4__OgNU.js', revision: null },
        { url: 'assets/warehouseStore-F4KJWslq.js', revision: null },
        { url: 'assets/WarehousePDA-BQ1hiGAL.js', revision: null },
        { url: 'assets/Views-WDOhx8Q-.js', revision: null },
        { url: 'assets/vfs_fonts-C24r0ruI.js', revision: null },
        { url: 'assets/VerificarCertificado-B4e2u195.js', revision: null },
        { url: 'assets/useRealtimeTable-CtFo-yTh.js', revision: null },
        { url: 'assets/useBarcodeScanner-DWeWSbvT.js', revision: null },
        { url: 'assets/UploadHistory-DeAtEIzQ.js', revision: null },
        { url: 'assets/ui-vendor-D-9zQVt7.js', revision: null },
        { url: 'assets/TrazabilidadModal-COGNmczy.js', revision: null },
        { url: 'assets/Traspasos-CvnIMxRB.js', revision: null },
        { url: 'assets/Transporte-z8I4u6jg.js', revision: null },
        { url: 'assets/Tickets-BE6_itxE.js', revision: null },
        { url: 'assets/supabase-vendor-jY4wIOEF.js', revision: null },
        { url: 'assets/storageUrl-BkPs7gEk.js', revision: null },
        { url: 'assets/SolicitudPublica-Ch0X-Kph.js', revision: null },
        { url: 'assets/Seguridad-eftIbKTC.js', revision: null },
        { url: 'assets/securityService-BLSLoItO.js', revision: null },
        { url: 'assets/SalesStatus-o9utKJ_W.js', revision: null },
        { url: 'assets/ReceptionNacional-D-sjcD0G.js', revision: null },
        { url: 'assets/Reception-D-WlHHdN.js', revision: null },
        { url: 'assets/react-vendor-C8fdn38R.js', revision: null },
        { url: 'assets/QueryErrorState-Ca2nvJNI.js', revision: null },
        { url: 'assets/query-vendor-B1MP_4YJ.js', revision: null },
        { url: 'assets/ProductDatasheet-CChnNupN.js', revision: null },
        { url: 'assets/Postventa-DtSiR9w_.js', revision: null },
        { url: 'assets/PodCapture-KtR-8_MA.js', revision: null },
        { url: 'assets/pickingStore-B6NG5l76.js', revision: null },
        { url: 'assets/pdfmake-BwwREtpy.js', revision: null },
        { url: 'assets/PanelTVReal-C7Wh38NL.js', revision: null },
        { url: 'assets/panelPtm-Dmjw8r-R.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-BrWHiqAA.js', revision: null },
        { url: 'assets/PanelIngresar-DYyzltqt.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-q-i-Czx_.js', revision: null },
        { url: 'assets/PanelConfigReal-BWSFf75Z.js', revision: null },
        { url: 'assets/PanelBuilderReal-CzsT6Z7i.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-DKo1kQkA.js', revision: null },
        { url: 'assets/NotFound-3sCqnTFJ.js', revision: null },
        { url: 'assets/Monitoreo-CeOodLYu.js', revision: null },
        { url: 'assets/MiRuta-hr_t-2qC.js', revision: null },
        { url: 'assets/MiBandeja-BGv__wXu.js', revision: null },
        { url: 'assets/logUpload-xOVNjhgs.js', revision: null },
        { url: 'assets/Login-CA_pW-zx.js', revision: null },
        { url: 'assets/LocationManager-DTMmuj-l.js', revision: null },
        { url: 'assets/Insumos-CPgFradU.js', revision: null },
        { url: 'assets/index-Drg5LWU6.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-CXYp_lIK.js', revision: null },
        { url: 'assets/index-Cpmu9M5B.js', revision: null },
        { url: 'assets/index-ClqN--ok.js', revision: null },
        { url: 'assets/iamService-Bz36_tsQ.js', revision: null },
        { url: 'assets/HistorialNV-XRTUpJoD.js', revision: null },
        { url: 'assets/Heatmap-KcTZQDm6.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DOJOsVIM.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-D2OE6MXL.js', revision: null },
        { url: 'assets/Entry-BcZUweb6.js', revision: null },
        { url: 'assets/DispatchControl-CPtbJI5i.js', revision: null },
        { url: 'assets/DataImport-QTho8jBz.js', revision: null },
        { url: 'assets/dashData-BBIMQTdq.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CDal-Bpe.js', revision: null },
        { url: 'assets/CubingRegistry-Ba-7A-_k.js', revision: null },
        { url: 'assets/conteoService-ChJ0NynO.js', revision: null },
        { url: 'assets/ConteoCiclico-DXujPNf4.js', revision: null },
        { url: 'assets/ConsultaNV-BG0l7Lub.js', revision: null },
        { url: 'assets/ConsultaGrupo-BUVXubxj.js', revision: null },
        { url: 'assets/configService-BraK-2oZ.js', revision: null },
        { url: 'assets/comunasChile-awF-uuwM.js', revision: null },
        { url: 'assets/Cleanup-705aaFkM.js', revision: null },
        { url: 'assets/ClasificacionProductos-D_MIKBy8.js', revision: null },
        { url: 'assets/charts-vendor-BPHLCusR.js', revision: null },
        { url: 'assets/Carteles-CzAHvvDG.js', revision: null },
        { url: 'assets/calidadService-ByHp7Hdy.js', revision: null },
        { url: 'assets/CalidadBadge-C0td9HUq.js', revision: null },
        { url: 'assets/BodegasSoftland-hdsMDs4n.js', revision: null },
        { url: 'assets/BloqueDetalle-DzlXW-aW.js', revision: null },
        { url: 'assets/Batches-Bzl9Zaqo.js', revision: null },
        { url: 'assets/ApiKeys-CKvxRUDl.js', revision: null },
        { url: 'assets/animation-vendor-BwUUObbT.js', revision: null },
        { url: 'assets/AnalisisCodigos-CeS4eyaq.js', revision: null },
        { url: 'assets/AdminMonitor-DDaEDvRq.js', revision: null },
        { url: 'assets/Addresses-69dHXt21.js', revision: null },
        { url: 'assets/AccionIntegracion-BCM0vzoh.js', revision: null },
        { url: 'assets/AccionesCalidad-WaZhCzRe.js', revision: null },
        { url: 'assets/AccessControl-CDpVfX3n.js', revision: null },
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
