"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}

export default function Badge({ children, variant = "default", size = "sm", dot = false }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    success: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
    danger: "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400",
    info: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  };

  const dotColors = {
    default: "bg-gray-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
