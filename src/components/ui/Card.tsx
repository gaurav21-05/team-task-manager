"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, glass = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-300 ${
        glass
          ? "bg-white/5 dark:bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/10"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      } ${
        hover ? "hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-b border-gray-100 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
