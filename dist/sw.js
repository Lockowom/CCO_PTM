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
        { url: 'index.html', revision: 'de4efffa9635f44c3243241da0d2d170' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-DEAMe_kw.js', revision: null },
        { url: 'assets/WmsLocations-BswwAtDj.js', revision: null },
        { url: 'assets/web-CPi6yVPo.js', revision: null },
        { url: 'assets/web-CdZpIP_C.js', revision: null },
        { url: 'assets/web-BSJWkExo.js', revision: null },
        { url: 'assets/warehouseStore-selABiHS.js', revision: null },
        { url: 'assets/WarehousePDA-BoIf6SYh.js', revision: null },
        { url: 'assets/Views-BXj9u6dF.js', revision: null },
        { url: 'assets/vfs_fonts-5uhwfOEQ.js', revision: null },
        { url: 'assets/VerificarCertificado-CZf_LT0Z.js', revision: null },
        { url: 'assets/useRealtimeTable-B0el-txd.js', revision: null },
        { url: 'assets/useBarcodeScanner-DBKrXJxf.js', revision: null },
        { url: 'assets/UploadHistory-AWZrlSG5.js', revision: null },
        { url: 'assets/ui-vendor-D9BeWSwh.js', revision: null },
        { url: 'assets/TrazabilidadModal-L8QxNZ3x.js', revision: null },
        { url: 'assets/Traspasos-BhO0zQud.js', revision: null },
        { url: 'assets/Transporte-z6af3RQX.js', revision: null },
        { url: 'assets/Tickets-BT1EOq5G.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-VYqbao13.js', revision: null },
        { url: 'assets/SolicitudPublica-BfMxSemf.js', revision: null },
        { url: 'assets/Seguridad-enFajHi7.js', revision: null },
        { url: 'assets/securityService-BNuuCxBM.js', revision: null },
        { url: 'assets/SalesStatus-zpqTOx3g.js', revision: null },
        { url: 'assets/ReceptionNacional-DSgVp_Zl.js', revision: null },
        { url: 'assets/Reception-C_EpqACX.js', revision: null },
        { url: 'assets/react-vendor-CczoB5o5.js', revision: null },
        { url: 'assets/QueryErrorState-Cftbgbl3.js', revision: null },
        { url: 'assets/query-vendor-AW4268wa.js', revision: null },
        { url: 'assets/ProductDatasheet-B9-DD6dw.js', revision: null },
        { url: 'assets/Postventa-B0646yhI.js', revision: null },
        { url: 'assets/PodCapture-DHRYv_kU.js', revision: null },
        { url: 'assets/pickingStore-CuXBAwMi.js', revision: null },
        { url: 'assets/pdfmake-D8-GTQ7-.js', revision: null },
        { url: 'assets/PanelTVReal-Dn6rfWgP.js', revision: null },
        { url: 'assets/panelPtm-V0LeLw-l.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-D5WtoGs9.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelIngresar-BRH0PxrP.js', revision: null },
        { url: 'assets/PanelInfoReal-BFdLjCvy.js', revision: null },
        { url: 'assets/PanelConfigReal-DnshWnDB.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/PanelBuilderReal-C70mW3D8.js', revision: null },
        { url: 'assets/Observability-D0FSslIR.js', revision: null },
        { url: 'assets/NotFound-DGiS7PMg.js', revision: null },
        { url: 'assets/Monitoreo-BmpCFuq2.js', revision: null },
        { url: 'assets/MiRuta-DCZVZv_K.js', revision: null },
        { url: 'assets/MiBandeja-qsiHrWni.js', revision: null },
        { url: 'assets/logUpload-BiODRl_2.js', revision: null },
        { url: 'assets/Login-Dr2NRwqx.js', revision: null },
        { url: 'assets/LocationManager-PJ6C9JJ-.js', revision: null },
        { url: 'assets/Insumos-BJOCFc6g.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-CqzNuJmr.js', revision: null },
        { url: 'assets/index-Cm-QZeNi.js', revision: null },
        { url: 'assets/index-CKBQV3Ro.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/iamService-C5GJhxrp.js', revision: null },
        { url: 'assets/HistorialNV-CQgnBBbf.js', revision: null },
        { url: 'assets/Heatmap-W8MbZtJz.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-Br97pa8J.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-BuA_ShLd.js', revision: null },
        { url: 'assets/Entry-DG5izOzE.js', revision: null },
        { url: 'assets/DispatchControl-CuesxR8C.js', revision: null },
        { url: 'assets/DataImport-D1ms_xb7.js', revision: null },
        { url: 'assets/dashData-Clk2kuOi.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-CrJwQ9mq.js', revision: null },
        { url: 'assets/CubingRegistry-4_I5TXQk.js', revision: null },
        { url: 'assets/conteoService-CteB60sm.js', revision: null },
        { url: 'assets/ConteoCiclico-BIwnlT_J.js', revision: null },
        { url: 'assets/ConsultaNV-C2q03fdp.js', revision: null },
        { url: 'assets/ConsultaGrupo-Bw97GUe9.js', revision: null },
        { url: 'assets/configService-et7UL3-j.js', revision: null },
        { url: 'assets/comunasChile-D2vp6vIg.js', revision: null },
        { url: 'assets/Cleanup-BWfmE3df.js', revision: null },
        { url: 'assets/ClasificacionProductos-B7UVXhra.js', revision: null },
        { url: 'assets/charts-vendor-Bk5-SXWK.js', revision: null },
        { url: 'assets/Carteles-CZUllD0j.js', revision: null },
        { url: 'assets/calidadService-BVISU5Ux.js', revision: null },
        { url: 'assets/CalidadBadge-B9goYA8f.js', revision: null },
        { url: 'assets/BodegasSoftland-BHI5R6iQ.js', revision: null },
        { url: 'assets/BloqueDetalle-Bbe39zuu.js', revision: null },
        { url: 'assets/Batches-cjnGkzJR.js', revision: null },
        { url: 'assets/ApiKeys-DDlJd3Bz.js', revision: null },
        { url: 'assets/animation-vendor-Bm2mNA5x.js', revision: null },
        { url: 'assets/AnalisisCodigos-DnnaaEyz.js', revision: null },
        { url: 'assets/AdminMonitor-CZ0Nddnf.js', revision: null },
        { url: 'assets/Addresses-QGngiIC7.js', revision: null },
        { url: 'assets/AccionIntegracion-Ddvvq8jN.js', revision: null },
        { url: 'assets/AccionesCalidad-vHQO_b5f.js', revision: null },
        { url: 'assets/AccessControl-DDOBWPzY.js', revision: null },
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
