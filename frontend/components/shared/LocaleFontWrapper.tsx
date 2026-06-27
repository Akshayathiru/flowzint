"use client";

import React from "react";
import { useLocaleFontClass } from "./LocaleFont";

export function LocaleFontWrapper({ children }: { children: React.ReactNode }) {
  const fontClass = useLocaleFontClass();
  return <div className={fontClass}>{children}</div>;
}
