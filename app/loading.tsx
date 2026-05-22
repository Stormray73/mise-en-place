import React from "react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 w-1/2 rounded-full animate-[loading-progress_1.5s_infinite_linear]"></div>
      </div>

      {/* Glassmorphic Central Spinner */}
      <div className="flex flex-col items-center gap-3 p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="relative w-12 h-12">
          {/* Inner pulse */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
          {/* Main spinning ring */}
          <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <span className="text-sm font-medium tracking-wide text-zinc-300 select-none animate-pulse">
          Mise en place...
        </span>
      </div>

      <style>{`
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
