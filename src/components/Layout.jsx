import React from 'react';
import Navbar from './Navbar';
import ErrorReportWidget from './ErrorReportWidget';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-poppins flex flex-col">
      {/* Top Navbar - El único menú */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-6 lg:px-8 overflow-y-auto bg-white">
        <div className="max-w-[1920px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Widget de Errores */}
      <ErrorReportWidget />
    </div>
  );
};

export default Layout;
