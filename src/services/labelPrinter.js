// Edge Function para impresión ZPL
import { supabase } from '../supabase';

export const LabelPrinter = {
  /**
   * Genera y envía a imprimir una etiqueta ZPL estándar de 4x6"
   * @param {object} data - Datos de la etiqueta { sku, desc, batch, qty }
   * @param {string} printerId - ID de la impresora destino (opcional)
   */
  async printLabel(data, printerId = 'DEFAULT') {
    try {
      // 1. Generar código ZPL
      const zpl = `
        ^XA
        ^FO50,50^ADN,36,20^FD${data.sku}^FS
        ^FO50,100^ADN,18,10^FD${data.desc.substring(0, 30)}^FS
        ^FO50,150^BY3
        ^BCN,100,Y,N,N
        ^FD${data.sku}^FS
        ^FO50,300^ADN,18,10^FDLote: ${data.batch}^FS
        ^FO400,300^ADN,18,10^FDCant: ${data.qty}^FS
        ^XZ
      `;

      // 2. Enviar a cola de impresión (Tabla Supabase)
      // Un servicio local (Node.js/Python) en la red del almacén leerá esta tabla y enviará al puerto 9100
      const { error } = await supabase
        .from('tms_print_queue')
        .insert({
          printer_id: printerId,
          zpl_content: zpl,
          status: 'PENDING',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true, message: 'Enviado a cola de impresión' };

    } catch (err) {
      console.error('Error imprimiendo:', err);
      return { success: false, message: err.message };
    }
  }
};
