"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = { hasError: false, message: "" };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none font-sans">
            <AlertTriangle size={32} className="text-amber-400 mb-4" />
            <p className="font-display font-semibold text-sm text-charcoal">
              Something went wrong
            </p>
            <p className="font-sans text-xs text-gray-500 mt-1 max-w-xs leading-normal">
              {this.state.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="mt-4 border border-gray-200 rounded-lg px-4 py-2 font-sans text-xs font-semibold text-gray-655 hover:bg-gray-50 bg-white shadow-sm transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
