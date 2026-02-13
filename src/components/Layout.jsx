import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 lg:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;