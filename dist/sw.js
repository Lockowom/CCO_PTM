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
        { url: 'index.html', revision: 'c4e97f15ea32e0ba2357b5340bd48f84' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-CmeMkDsY.js', revision: null },
        { url: 'assets/WmsLocations-CLKXOdvT.js', revision: null },
        { url: 'assets/web-CWpHv5rd.js', revision: null },
        { url: 'assets/web-CTC220j1.js', revision: null },
        { url: 'assets/web-BUXWevfG.js', revision: null },
        { url: 'assets/warehouseStore-Clu9OKtg.js', revision: null },
        { url: 'assets/WarehousePDA-EHYMG14t.js', revision: null },
        { url: 'assets/Views-eQA7gwS5.js', revision: null },
        { url: 'assets/vfs_fonts-CfcbzCvn.js', revision: null },
        { url: 'assets/VerificarCertificado-BOSvPXVq.js', revision: null },
        { url: 'assets/useRealtimeTable-Dd0pEZY2.js', revision: null },
        { url: 'assets/useBarcodeScanner-DcSXiM6G.js', revision: null },
        { url: 'assets/UploadHistory-BKRRYMQo.js', revision: null },
        { url: 'assets/ui-vendor-naG2PYVT.js', revision: null },
        { url: 'assets/TrazabilidadModal-Dka37RdK.js', revision: null },
        { url: 'assets/Traspasos-C2XKqo2e.js', revision: null },
        { url: 'assets/Transporte-Ck8n0yYf.js', revision: null },
        { url: 'assets/Tickets-C6t4GEmA.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BXuXZtMj.js', revision: null },
        { url: 'assets/SolicitudPublica-BPmjn9LE.js', revision: null },
        { url: 'assets/Seguridad-kT6KxnIO.js', revision: null },
        { url: 'assets/securityService-CAr00Qet.js', revision: null },
        { url: 'assets/SalesStatus-CB1cAKej.js', revision: null },
        { url: 'assets/ReceptionNacional-VTsxKhHf.js', revision: null },
        { url: 'assets/Reception-BoFs-D9V.js', revision: null },
        { url: 'assets/react-vendor-6aw4XXjH.js', revision: null },
        { url: 'assets/QueryErrorState-Bjb0rXX1.js', revision: null },
        { url: 'assets/query-vendor-BNjBrM5A.js', revision: null },
        { url: 'assets/ProductDatasheet-BqYVj_Ct.js', revision: null },
        { url: 'assets/Postventa-CKKY8w4b.js', revision: null },
        { url: 'assets/PodCapture-Bz78s8U8.js', revision: null },
        { url: 'assets/pickingStore-C4p-StM8.js', revision: null },
        { url: 'assets/pdfmake-pNuCVKVo.js', revision: null },
        { url: 'assets/PanelTVReal-DseuEhQJ.js', revision: null },
        { url: 'assets/panelPtm-B1JY9g4d.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-CUwlUvw3.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BIDEzjLy.js', revision: null },
        { url: 'assets/PanelInfoReal-CMVJD3u2.js', revision: null },
        { url: 'assets/PanelConfigReal-CvNtCylC.js', revision: null },
        { url: 'assets/PanelBuilderReal-vNBPn-Pw.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-cLREdcrK.js', revision: null },
        { url: 'assets/NotFound-1AYY-h0B.js', revision: null },
        { url: 'assets/Monitoreo-CxDed-qx.js', revision: null },
        { url: 'assets/MiRuta-ChUn0qv2.js', revision: null },
        { url: 'assets/MiBandeja-h7aL2Se_.js', revision: null },
        { url: 'assets/logUpload-BgkX11EA.js', revision: null },
        { url: 'assets/Login-BOAgTEqh.js', revision: null },
        { url: 'assets/LocationManager-DgwoRiKs.js', revision: null },
        { url: 'assets/Insumos-CZvgBs_m.js', revision: null },
        { url: 'assets/index-PPVYtLxb.js', revision: null },
        { url: 'assets/index-HtLNpUHT.css', revision: null },
        { url: 'assets/index-DH2X3u_W.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-5D5asll0.js', revision: null },
        { url: 'assets/iamService-B_r5oW2C.js', revision: null },
        { url: 'assets/HistorialNV-CH_nFN4b.js', revision: null },
        { url: 'assets/Heatmap-BRlIcb-j.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-vlWR1v2U.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-U-1YHIWD.js', revision: null },
        { url: 'assets/Entry-BX9N25VS.js', revision: null },
        { url: 'assets/DispatchControl-BrvWb_Ul.js', revision: null },
        { url: 'assets/DataImport-CG1dM19a.js', revision: null },
        { url: 'assets/dashData-BOy2SRXx.js', revision: null },
        { url: 'assets/DashboardReal-DpWlOGSk.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/CubingRegistry-CNF9Ivv5.js', revision: null },
        { url: 'assets/conteoService-COs_GE5H.js', revision: null },
        { url: 'assets/ConteoCiclico-CYsBdXS_.js', revision: null },
        { url: 'assets/ConsultaNV-DeiJCS_J.js', revision: null },
        { url: 'assets/ConsultaGrupo-DsV55l3c.js', revision: null },
        { url: 'assets/configService-DdWDA1HO.js', revision: null },
        { url: 'assets/comunasChile-vpGpD8vq.js', revision: null },
        { url: 'assets/Cleanup-BZZ8R393.js', revision: null },
        { url: 'assets/ClasificacionProductos-CTcJR71V.js', revision: null },
        { url: 'assets/charts-vendor-7leLLwOT.js', revision: null },
        { url: 'assets/Carteles-D52znL4_.js', revision: null },
        { url: 'assets/calidadService-DJgwe5QM.js', revision: null },
        { url: 'assets/CalidadBadge-CO-8zjdL.js', revision: null },
        { url: 'assets/BodegasSoftland-BEmZO4nL.js', revision: null },
        { url: 'assets/BloqueDetalle-aGJuZAIR.js', revision: null },
        { url: 'assets/Batches-feZivR0n.js', revision: null },
        { url: 'assets/ApiKeys-RTIhxFrJ.js', revision: null },
        { url: 'assets/animation-vendor-JfdD7EdN.js', revision: null },
        { url: 'assets/AnalisisCodigos-DNSH6s9h.js', revision: null },
        { url: 'assets/AdminMonitor-BE5MaxSj.js', revision: null },
        { url: 'assets/Addresses-BdDgjzmk.js', revision: null },
        { url: 'assets/AccionIntegracion-DZAdOb5f.js', revision: null },
        { url: 'assets/AccionesCalidad-QIS3oQdd.js', revision: null },
        { url: 'assets/AccessControl-C-A5t9Ui.js', revision: null },
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
