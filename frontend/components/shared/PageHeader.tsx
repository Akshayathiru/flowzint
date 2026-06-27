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
    <header className="px-4 lg:px-6 pt-5 pb-4 border-b border-gray-200 bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shrink-0 font-sans">
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
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </header>
  );
}
