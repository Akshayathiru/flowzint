"use client";

import React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Content wrapper */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onClose: () => onOpenChange(false),
          } as React.Attributes & { onClose?: () => void });
        }
        return child;
      })}
    </div>
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DialogContent({
  children,
  onClose,
  className = "",
  ...props
}: DialogContentProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      {...props}
      className={`relative bg-white rounded-xl border border-gray-200 p-6 shadow-xl max-w-lg w-full z-50 transition-all transform duration-300 ${className}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:text-charcoal hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onClose } as React.Attributes & { onClose?: () => void });
        }
        return child;
      })}
    </div>
  );
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col space-y-1 text-left mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({
  children,
  className = "",
  ...props
}: DialogTitleProps) {
  return (
    <h2
      {...props}
      className={`text-base font-semibold leading-none tracking-tight text-charcoal font-display ${className}`}
    >
      {children}
    </h2>
  );
}
