"use client";

import React from "react";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <header className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 font-sans">
      {/* Left branding/description */}
      <div className="flex flex-col">
        <h1 className="font-display font-bold text-xl text-charcoal">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-xs text-gray-400 mt-1 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right actions slot */}
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
