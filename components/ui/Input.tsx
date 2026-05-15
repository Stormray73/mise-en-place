/**
 * FILE: components/ui/Input.tsx
 * DESCRIPTION: Standardized input component for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs text-zinc-500 mb-1 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-zinc-500 text-sm transition-all ${className}`}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
