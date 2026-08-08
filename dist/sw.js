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
        { url: 'index.html', revision: 'beae181b861ce5db34771e49e1125897' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-NQDhGUxh.js', revision: null },
        { url: 'assets/WmsLocations-DPQH4Lle.js', revision: null },
        { url: 'assets/web-DcfgUEOi.js', revision: null },
        { url: 'assets/web-8vWbOgxL.js', revision: null },
        { url: 'assets/web-5SI5HQ_3.js', revision: null },
        { url: 'assets/warehouseStore-DVlG6VhU.js', revision: null },
        { url: 'assets/WarehousePDA-Dx1pBEP_.js', revision: null },
        { url: 'assets/Views-QV5_P3wJ.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-C9Fgrlqg.js', revision: null },
        { url: 'assets/useRealtimeTable-DfAB2sdn.js', revision: null },
        { url: 'assets/useBarcodeScanner-C6xj8Xm7.js', revision: null },
        { url: 'assets/UploadHistory-xGJZC7iK.js', revision: null },
        { url: 'assets/ui-vendor-CTbhg6u_.js', revision: null },
        { url: 'assets/TrazabilidadModal-DBcrKrI1.js', revision: null },
        { url: 'assets/Traspasos-DW8f0Ury.js', revision: null },
        { url: 'assets/Transporte-RYNukjFQ.js', revision: null },
        { url: 'assets/Tickets-s--hz6rV.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-DOP9j2tB.js', revision: null },
        { url: 'assets/SolicitudPublica-BkU4rVNa.js', revision: null },
        { url: 'assets/Seguridad-fByJzw1F.js', revision: null },
        { url: 'assets/securityService-DW_Pwchp.js', revision: null },
        { url: 'assets/SalesStatus-BHY-j0Ka.js', revision: null },
        { url: 'assets/ReceptionNacional-DQ5uQCX-.js', revision: null },
        { url: 'assets/Reception-BgOwUPeX.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Ct5YgOln.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-B-VJrKiB.js', revision: null },
        { url: 'assets/Postventa-BX0aVwpy.js', revision: null },
        { url: 'assets/PodCapture-BpW6OkXJ.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-CFq9x2Jt.js', revision: null },
        { url: 'assets/panelPtm-B-hf_e9-.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CEyQP8aU.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-Ccjc56RV.js', revision: null },
        { url: 'assets/PanelInfoReal-Ag7B9Dgw.js', revision: null },
        { url: 'assets/PanelConfigReal-C8IlHBxN.js', revision: null },
        { url: 'assets/PanelBuilderReal-Cn40g4oR.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-mt4N6ToM.js', revision: null },
        { url: 'assets/NotFound-IdZ5KrLI.js', revision: null },
        { url: 'assets/Monitoreo-CGEbn5Dy.js', revision: null },
        { url: 'assets/MiRuta-Cw8ZmqqH.js', revision: null },
        { url: 'assets/MiBandeja-BEQJqb3c.js', revision: null },
        { url: 'assets/logUpload-B8Ffap_5.js', revision: null },
        { url: 'assets/Login-COKq3l2l.js', revision: null },
        { url: 'assets/LocationManager-BuSwL8hz.js', revision: null },
        { url: 'assets/Insumos-DX63xx4w.js', revision: null },
        { url: 'assets/ingresarService-C3cXbmEb.js', revision: null },
        { url: 'assets/index-PZJW2EPd.js', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-D2a72Qk7.css', revision: null },
        { url: 'assets/index-CbBUgauO.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-D9ZbZEgG.js', revision: null },
        { url: 'assets/HistorialNV-D35hJsoY.js', revision: null },
        { url: 'assets/Heatmap-q5enT1Wy.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-DY-Ay4MY.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-2ooY--Cz.js', revision: null },
        { url: 'assets/Entry-CpV_qxzL.js', revision: null },
        { url: 'assets/DispatchControl-D_XTXXhK.js', revision: null },
        { url: 'assets/DataImport-D1D2E7Gc.js', revision: null },
        { url: 'assets/dashData-Cl8oXyuE.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-C-9WrF83.js', revision: null },
        { url: 'assets/CubingRegistry-CG5DSWvc.js', revision: null },
        { url: 'assets/conteoService-C6NyzDUY.js', revision: null },
        { url: 'assets/ConteoCiclico-DDswjDA1.js', revision: null },
        { url: 'assets/ConsultaNV-CfC9P9RL.js', revision: null },
        { url: 'assets/ConsultaGrupo-ClhftAFJ.js', revision: null },
        { url: 'assets/configService-RVlRPIiq.js', revision: null },
        { url: 'assets/comunasChile-CeR9GllW.js', revision: null },
        { url: 'assets/Cleanup-BbdUSwvN.js', revision: null },
        { url: 'assets/ClasificacionProductos-BdsMBYQ4.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-JhOijcyk.js', revision: null },
        { url: 'assets/calidadService-D6c6IJOB.js', revision: null },
        { url: 'assets/CalidadBadge-DbHqNcNT.js', revision: null },
        { url: 'assets/BodegasSoftland-vfi4nLd5.js', revision: null },
        { url: 'assets/BloqueDetalle-BYvus-hi.js', revision: null },
        { url: 'assets/Batches-Ca3IHXAj.js', revision: null },
        { url: 'assets/ApiKeys-D9QPyjhS.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DPx_e-LF.js', revision: null },
        { url: 'assets/AdminMonitor-CBeNeT8F.js', revision: null },
        { url: 'assets/Addresses-Bmc1Czg1.js', revision: null },
        { url: 'assets/AccionIntegracion-ngw22cq5.js', revision: null },
        { url: 'assets/AccionesCalidad-COKS3_fh.js', revision: null },
        { url: 'assets/AccessControl-DnvpH2SC.js', revision: null },
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
