/**
 * FILE: components/ui/Button.tsx
 * DESCRIPTION: Standardized button component with variants for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "active";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-white text-black hover:bg-zinc-200 rounded-full font-bold transform hover:scale-105",
      secondary:
        "bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium",
      ghost: "text-zinc-400 hover:text-zinc-200 font-medium",
      danger: "bg-red-600 hover:bg-red-700 text-white rounded-md font-medium",
      active: "bg-blue-600 text-white shadow-sm rounded-md font-medium",
    };

    const sizes = {
      sm: "px-3 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-10 py-3 text-base",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
