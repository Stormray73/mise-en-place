"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black min-h-[50vh]">
      {/* Top-anchored animated shimmer progress bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-zinc-900 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-1/2 animate-shimmer absolute top-0 left-0" />
      </div>

      {/* Centered Premium Loader */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-zinc-950 flex items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              CINC
            </span>
          </div>
        </div>

        {/* Text */}
        <p className="text-sm text-zinc-400 font-medium tracking-wide animate-pulse">
          Loading kitchen...
        </p>
      </div>
    </div>
  );
}
