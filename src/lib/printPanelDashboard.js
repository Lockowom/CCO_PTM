// Genera un PDF usando el diálogo nativo del navegador. Al clonar el DOM y sus
// estilos actuales, las tarjetas, tablas, colores y gráficos se conservan tal
// como el usuario los ve en el Dashboard.
export function printPanelDashboard(node, range) {
  if (!node) throw new Error('No se encontró el contenido del Dashboard para imprimir.');

  // `noopener` hace que Chrome devuelva null para la referencia de la ventana:
  // la pestaña se abre, pero queda en blanco porque no podemos escribir en ella.
  const printWindow = window.open('', '_blank', 'width=1440,height=900');
  if (!printWindow) {
    throw new Error(
      'El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes.'
    );
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((style) => style.outerHTML)
    .join('\n');
  const period = `${range?.from || 'Inicio'} al ${range?.to || 'Hoy'}`;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Panel PTM - ${period}</title>
        ${styles}
        <style>
          @page { size: A4 landscape; margin: 7mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 100%; margin: 0; background: #f9fafb !important; }
          .dash-root { min-height: auto !important; background: #f9fafb !important; }
          .dash-root header { position: static !important; }
          [data-print-ignore="true"] { display: none !important; }
          .dash-root main { max-width: none !important; padding: 12px !important; }
          .dash-root .grid, .dash-root .table-container, .dash-root section { break-inside: avoid; page-break-inside: avoid; }
        </style>
      </head>
      <body>${node.outerHTML}</body>
    </html>`);
  printWindow.document.close();

  return new Promise((resolve) => {
    let printed = false;
    const executePrint = () => {
      if (printed) return;
      printed = true;
      printWindow.focus();
      printWindow.print();
      resolve();
    };
    printWindow.addEventListener('load', () => setTimeout(executePrint, 350), { once: true });
    // La ventana puede haber terminado de cargar antes de registrar el listener.
    setTimeout(() => {
      if (printWindow.document.readyState === 'complete') executePrint();
    }, 700);
  });
}
