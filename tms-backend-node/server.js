const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==================================================================
// ROUTES
// ==================================================================

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'TMS CCO Backend Running 🚀' });
});

// 1. GET Entregas (Filtrado y Paginado)
app.get('/api/entregas', async (req, res) => {
  try {
    const { estado, conductor_id, limit = 100 } = req.query;
    
    let query = supabase
      .from('tms_entregas')
      .select('*')
      .order('fecha_creacion', { ascending: false })
      .limit(limit);

    if (estado) query = query.eq('estado', estado);
    if (conductor_id) query = query.eq('conductor_id', conductor_id);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET Inventario (Partidas)
app.get('/api/inventario', async (req, res) => {
  try {
    const { producto } = req.query;
    let query = supabase.from('tms_partidas').select('*');
    
    if (producto) query = query.ilike('descripcion', `%${producto}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET Notas de Venta (Sales Orders)
app.get('/api/notas-venta', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const { data, error } = await supabase
      .from('tms_nv_diarias')
      .select('*')
      .order('fecha_emision', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET Series (Queries)
app.get('/api/series', async (req, res) => {
  try {
    const { serie, limit = 100 } = req.query;
    let query = supabase.from('tms_series').select('*').limit(limit);
    
    if (serie) query = query.ilike('serie', `%${serie}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. POST Crear Ruta (Optimización básica)
app.post('/api/rutas', async (req, res) => {
  try {
    const { nombre, conductor_id, entregas_ids } = req.body;
    
    // 1. Crear la ruta
    const { data: ruta, error: rutaError } = await supabase
      .from('tms_rutas')
      .insert([{ nombre, conductor_id, estado: 'PLANIFICADA' }])
      .select()
      .single();
      
    if (rutaError) throw rutaError;

    // 2. Asignar entregas a la ruta
    if (entregas_ids && entregas_ids.length > 0) {
      const { error: updateError } = await supabase
        .from('tms_entregas')
        .update({ ruta_id: ruta.id, estado: 'EN_RUTA' })
        .in('id', entregas_ids);
        
      if (updateError) throw updateError;
    }

    res.json({ success: true, ruta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
