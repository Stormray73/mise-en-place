/**
 * FILE: components/ui/Select.tsx
 * DESCRIPTION: Standardized select component for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm transition-all appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
