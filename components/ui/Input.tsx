/**
 * FILE: components/ui/Input.tsx
 * DESCRIPTION: Standardized input component for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-zinc-500 text-sm transition-all ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
