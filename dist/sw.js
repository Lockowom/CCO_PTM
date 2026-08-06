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
        { url: 'index.html', revision: 'd3752ed6964bb6cb94abe31a0fa17f5b' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-D4HgoEwM.js', revision: null },
        { url: 'assets/WmsLocations-CbHw1Mxb.js', revision: null },
        { url: 'assets/web-_Z_vKod3.js', revision: null },
        { url: 'assets/web-Bu8_mBUV.js', revision: null },
        { url: 'assets/web-BbrNQ_6e.js', revision: null },
        { url: 'assets/warehouseStore-Df5TiYJm.js', revision: null },
        { url: 'assets/WarehousePDA-DVVGeQkB.js', revision: null },
        { url: 'assets/Views-Bt3H2XiQ.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-DZxGPJkz.js', revision: null },
        { url: 'assets/useRealtimeTable-CP0667FC.js', revision: null },
        { url: 'assets/useBarcodeScanner-BIyQCTYu.js', revision: null },
        { url: 'assets/UploadHistory-DdIGkeOs.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-Wc2fovem.js', revision: null },
        { url: 'assets/Traspasos-xYGWHbSi.js', revision: null },
        { url: 'assets/Transporte-2knqb6yf.js', revision: null },
        { url: 'assets/Tickets-DaLcdOVW.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-Cenh33XK.js', revision: null },
        { url: 'assets/SolicitudPublica-_FVDUJi1.js', revision: null },
        { url: 'assets/Seguridad-CTLDtG0X.js', revision: null },
        { url: 'assets/securityService-4DoHRjb2.js', revision: null },
        { url: 'assets/SalesStatus-joeqArgi.js', revision: null },
        { url: 'assets/ReceptionNacional-fPaTeGZ4.js', revision: null },
        { url: 'assets/Reception-kZ3IbHoT.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-CfCXerVc.js', revision: null },
        { url: 'assets/Postventa-DcOzezax.js', revision: null },
        { url: 'assets/PodCapture-Crk3QxPe.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CdFGX93Z.js', revision: null },
        { url: 'assets/panelPtm-D4WhndIl.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-B6d1o7Pl.js', revision: null },
        { url: 'assets/PanelInfoReal-BrHBX-CF.js', revision: null },
        { url: 'assets/PanelConfigReal-CZDGGHy5.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-BpifLF38.js', revision: null },
        { url: 'assets/Observability-B8SIzzOq.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-Dt6gfsvt.js', revision: null },
        { url: 'assets/MiRuta-Br_rTwQQ.js', revision: null },
        { url: 'assets/MiBandeja-B7GsNzpy.js', revision: null },
        { url: 'assets/logUpload-CVrrJnnG.js', revision: null },
        { url: 'assets/Login-0ri2f308.js', revision: null },
        { url: 'assets/LocationManager-CC2-7aY0.js', revision: null },
        { url: 'assets/Insumos-Dd8mlI5w.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-CvnzWbLN.css', revision: null },
        { url: 'assets/index-BRrXUgfV.js', revision: null },
        { url: 'assets/index-BN0_Dn3b.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-BfJhdTLf.js', revision: null },
        { url: 'assets/HistorialNV-CnqowEod.js', revision: null },
        { url: 'assets/Heatmap-DB8yEQji.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-37vVyCS7.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-GWCRBX_Y.js', revision: null },
        { url: 'assets/Entry-Dtuo_N5t.js', revision: null },
        { url: 'assets/DispatchControl-k6RLSF-K.js', revision: null },
        { url: 'assets/DataImport-mC-iHcy6.js', revision: null },
        { url: 'assets/dashData-49yWSPAj.js', revision: null },
        { url: 'assets/DashboardReal-jTar-1bH.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-BzHMXCQZ.js', revision: null },
        { url: 'assets/conteoService-D_MVcA5e.js', revision: null },
        { url: 'assets/ConteoCiclico-B2hff1ty.js', revision: null },
        { url: 'assets/ConsultaNV-xydHkKgs.js', revision: null },
        { url: 'assets/ConsultaGrupo-DhCVAVER.js', revision: null },
        { url: 'assets/configService-C-dXVvYp.js', revision: null },
        { url: 'assets/comunasChile-CAQwvaFH.js', revision: null },
        { url: 'assets/Cleanup-CWho7Zio.js', revision: null },
        { url: 'assets/ClasificacionProductos-v1YTWRbH.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-CGSMLg0a.js', revision: null },
        { url: 'assets/calidadService-D82ZemyV.js', revision: null },
        { url: 'assets/CalidadBadge-BsI0STqc.js', revision: null },
        { url: 'assets/BodegasSoftland-CMG5KByf.js', revision: null },
        { url: 'assets/BloqueDetalle-Dwb60PAa.js', revision: null },
        { url: 'assets/Batches-B4q6oVFc.js', revision: null },
        { url: 'assets/ApiKeys-BcxKSC8e.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-Bxew7aPo.js', revision: null },
        { url: 'assets/AdminMonitor-CZ__lTT0.js', revision: null },
        { url: 'assets/Addresses-BLwngLv1.js', revision: null },
        { url: 'assets/AccionIntegracion-Cwqjol5-.js', revision: null },
        { url: 'assets/AccionesCalidad-BJUtn8B5.js', revision: null },
        { url: 'assets/AccessControl-CWyzAIuI.js', revision: null },
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
