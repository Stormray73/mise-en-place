/**
 * FILE: components/ui/Select.tsx
 * DESCRIPTION: Standardized select component for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React, { useId } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, options, children, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs text-zinc-500 mb-1 block"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm transition-all appearance-none ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  },
);

Select.displayName = "Select";
