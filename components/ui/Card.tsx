/**
 * FILE: components/ui/Card.tsx
 * DESCRIPTION: Standardized card component with sub-components for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", children, ...props }: CardProps) => {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className = "",
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={`px-4 py-3 bg-zinc-800/50 border-b border-zinc-800 flex justify-between items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({
  className = "",
  children,
  ...props
}: CardProps) => {
  return (
    <h2
      className={`text-sm font-bold uppercase tracking-wider text-zinc-400 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

export const CardContent = ({
  className = "",
  children,
  ...props
}: CardProps) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
