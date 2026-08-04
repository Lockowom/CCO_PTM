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
        { url: 'index.html', revision: '30b18af2b39ae77073f165728ff8596e' },
        { url: 'assets/xlsx-B2eTCt_Q.js', revision: null },
        { url: 'assets/Workflows-CPMLaiOW.js', revision: null },
        { url: 'assets/WmsLocations-BgB3O73K.js', revision: null },
        { url: 'assets/web-SnVuer7U.js', revision: null },
        { url: 'assets/web-DhnNOf1C.js', revision: null },
        { url: 'assets/web-0qvI3oPr.js', revision: null },
        { url: 'assets/warehouseStore-BsVmwRd0.js', revision: null },
        { url: 'assets/WarehousePDA-1VNX_eNP.js', revision: null },
        { url: 'assets/Views-s1njO7gJ.js', revision: null },
        { url: 'assets/vfs_fonts-5uhwfOEQ.js', revision: null },
        { url: 'assets/VerificarCertificado-DLDODrZM.js', revision: null },
        { url: 'assets/useRealtimeTable-D-lFZMXU.js', revision: null },
        { url: 'assets/useBarcodeScanner-DNKZiaIW.js', revision: null },
        { url: 'assets/UploadHistory-ASeIkLaX.js', revision: null },
        { url: 'assets/ui-vendor-D9BeWSwh.js', revision: null },
        { url: 'assets/TrazabilidadModal-B4ntGJV-.js', revision: null },
        { url: 'assets/Traspasos-DdTpWpwh.js', revision: null },
        { url: 'assets/Transporte-B0S4-LGp.js', revision: null },
        { url: 'assets/Tickets-nN8YoQWr.js', revision: null },
        { url: 'assets/supabase-vendor-4Fjsfb0a.js', revision: null },
        { url: 'assets/storageUrl-BLGDK2P-.js', revision: null },
        { url: 'assets/SolicitudPublica-CF3mE1nT.js', revision: null },
        { url: 'assets/Seguridad-DFKIYveV.js', revision: null },
        { url: 'assets/securityService-juHz3uLB.js', revision: null },
        { url: 'assets/SalesStatus-DPRdywaS.js', revision: null },
        { url: 'assets/ReceptionNacional-ByK9ThsR.js', revision: null },
        { url: 'assets/Reception-TD47FiKV.js', revision: null },
        { url: 'assets/react-vendor-CczoB5o5.js', revision: null },
        { url: 'assets/QueryErrorState-Cftbgbl3.js', revision: null },
        { url: 'assets/query-vendor-AW4268wa.js', revision: null },
        { url: 'assets/ProductDatasheet-DiG47rRx.js', revision: null },
        { url: 'assets/Postventa-D_ESny-2.js', revision: null },
        { url: 'assets/PodCapture-Bc1Ok3Nz.js', revision: null },
        { url: 'assets/pickingStore-CuXBAwMi.js', revision: null },
        { url: 'assets/pdfmake-D8-GTQ7-.js', revision: null },
        { url: 'assets/PanelTVReal-BVpW2JIj.js', revision: null },
        { url: 'assets/panelPtm-D_o1sGfb.js', revision: null },
        { url: 'assets/PanelLayout-vrFRyWhm.css', revision: null },
        { url: 'assets/PanelLayout-D5WtoGs9.js', revision: null },
        { url: 'assets/PanelIngresar-CV0GOaKh.js', revision: null },
        { url: 'assets/PanelIngresar-CnJhtRV5.css', revision: null },
        { url: 'assets/PanelInfoReal-CeNzB0c0.js', revision: null },
        { url: 'assets/PanelConfigReal-B-FRTKf4.js', revision: null },
        { url: 'assets/PanelBuilderReal-CrNqpSOX.js', revision: null },
        { url: 'assets/PanelBuilderReal-ChDF2ngo.css', revision: null },
        { url: 'assets/Observability-jXsPNump.js', revision: null },
        { url: 'assets/NotFound-DGiS7PMg.js', revision: null },
        { url: 'assets/Monitoreo-BhGiRHFh.js', revision: null },
        { url: 'assets/MiRuta-PGsRoGno.js', revision: null },
        { url: 'assets/MiBandeja-BxfDj2rL.js', revision: null },
        { url: 'assets/logUpload-ZDFw-LY4.js', revision: null },
        { url: 'assets/Login-SCv2ahWU.js', revision: null },
        { url: 'assets/LocationManager-BrV_EVKa.js', revision: null },
        { url: 'assets/Insumos-DUkwR6N2.js', revision: null },
        { url: 'assets/index-DmLif1WD.css', revision: null },
        { url: 'assets/index-DaxBKrsQ.js', revision: null },
        { url: 'assets/index-CKBQV3Ro.js', revision: null },
        { url: 'assets/index-BmpJy8SR.js', revision: null },
        { url: 'assets/index-BezGgilr.js', revision: null },
        { url: 'assets/iamService-ioxr-_RE.js', revision: null },
        { url: 'assets/HistorialNV-KHAvWK9X.js', revision: null },
        { url: 'assets/Heatmap-CQSxJFvq.js', revision: null },
        { url: 'assets/formulaEngine-CFaRJv6o.js', revision: null },
        { url: 'assets/FlujoMaestro-fBJXCDE4.js', revision: null },
        { url: 'assets/exportExcel-D85v870c.js', revision: null },
        { url: 'assets/Eventos-Bds3Ji6-.js', revision: null },
        { url: 'assets/Entry-CN2AQIW-.js', revision: null },
        { url: 'assets/DispatchControl-DeSewDk2.js', revision: null },
        { url: 'assets/DataImport-jOOoBxR2.js', revision: null },
        { url: 'assets/dashData-B-VmKa-V.js', revision: null },
        { url: 'assets/DashboardReal-DlTC_ZMX.css', revision: null },
        { url: 'assets/DashboardReal-6bvAVsSe.js', revision: null },
        { url: 'assets/CubingRegistry-DFhHY7ci.js', revision: null },
        { url: 'assets/conteoService-BHl4S9VG.js', revision: null },
        { url: 'assets/ConteoCiclico-BXvWRe3H.js', revision: null },
        { url: 'assets/ConsultaNV-DM3qaY4u.js', revision: null },
        { url: 'assets/ConsultaGrupo-AFay_1DP.js', revision: null },
        { url: 'assets/configService-acQZTHZw.js', revision: null },
        { url: 'assets/comunasChile-DTKNuFHm.js', revision: null },
        { url: 'assets/Cleanup-CFE9TD55.js', revision: null },
        { url: 'assets/ClasificacionProductos-xa90nhiB.js', revision: null },
        { url: 'assets/charts-vendor-Bk5-SXWK.js', revision: null },
        { url: 'assets/Carteles-DXbRGfUk.js', revision: null },
        { url: 'assets/calidadService-DLMFlaXW.js', revision: null },
        { url: 'assets/CalidadBadge-CG-Zpcy5.js', revision: null },
        { url: 'assets/BodegasSoftland-xWwB06lC.js', revision: null },
        { url: 'assets/BloqueDetalle-BmHatd0b.js', revision: null },
        { url: 'assets/Batches-C3fOAkh0.js', revision: null },
        { url: 'assets/ApiKeys-YUmMnOfA.js', revision: null },
        { url: 'assets/animation-vendor-Bm2mNA5x.js', revision: null },
        { url: 'assets/AnalisisCodigos-C7w0jS6Q.js', revision: null },
        { url: 'assets/AdminMonitor-NRmhB50E.js', revision: null },
        { url: 'assets/Addresses-SEu-s7Gc.js', revision: null },
        { url: 'assets/AccionIntegracion-CaAmY04d.js', revision: null },
        { url: 'assets/AccionesCalidad-48ZngJje.js', revision: null },
        { url: 'assets/AccessControl-BpVjS1o9.js', revision: null },
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
