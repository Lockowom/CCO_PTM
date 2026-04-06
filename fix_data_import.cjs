const fs = require('fs');
const path = 'C:\\Users\\crisc\\Documents\\PROYECT CCO\\tms-backend-node\\CCO_PTM\\src\\pages\\Admin\\DataImport.jsx';
let content = fs.readFileSync(path, 'utf8');

const newTab = `    {
        id: 'inventario_general',
        label: 'Inv. Consolidado',
        icon: Layers,
        color: 'orange',
        table: 'tms_inventario_general',
        uniqueKey: 'bodega,codigo_producto', 
        columns: [
            { key: 'bodega', label: 'Bodega', required: true, type: 'text' },
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
        ],
        helpText: '📦 Ingresa el inventario consolidado. Asegúrate de incluir la columna "Bodega" (ej. BD 21, BD 5). Si el registro (Bodega + Producto) ya existe, se actualizará automáticamente.',
        smartDedup: false,
    },`;

content = content.replace(
    /const IMPORT_TABS = \[/,
    "const IMPORT_TABS = [\n" + newTab
);

fs.writeFileSync(path, content, 'utf8');
console.log('DataImport.jsx updated successfully.');