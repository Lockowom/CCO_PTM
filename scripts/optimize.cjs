const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

// Replace all component imports with React.lazy
const importRegex = /import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"](\.\/pages\/[^'"]+)['"];/g;
app = app.replace(importRegex, 'const $1 = React.lazy(() => import(\'$2\'));');

// Add Suspense to imports
if (!app.includes('Suspense')) {
  app = app.replace("import React, { useEffect } from 'react';", "import React, { useEffect, Suspense } from 'react';");
}

// Create a nice loader
const loader = `
// Global Suspense Loader Cyber-Logístico
const SuspenseLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
    <div className="relative w-24 h-24 mb-4">
      <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-orange-500/20 rounded-full animate-ping"></div>
      </div>
    </div>
    <h2 className="text-orange-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Inicializando Módulo...</h2>
  </div>
);
`;

if (!app.includes('SuspenseLoader')) {
  app = app.replace('// Componente de Acceso Denegado', loader + '\n// Componente de Acceso Denegado');
}

// Wrap Routes with Suspense
app = app.replace('<Routes>', '<Suspense fallback={<SuspenseLoader />}><Routes>');
app = app.replace('</Routes>', '</Routes></Suspense>');

fs.writeFileSync('src/App.jsx', app);
console.log('App.jsx optimized with Code Splitting!');
