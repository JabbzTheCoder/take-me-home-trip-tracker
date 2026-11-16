// components/layout/AppShell.jsx
import React from 'react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-amber-400 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 -left-48 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full"></div>
      </div>

      {/* Main Container with cohesive, deliberate padding across all screen sizes */}
      <div className="w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
