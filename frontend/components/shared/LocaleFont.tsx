"use client";

import { useLocale } from "next-intl";

const LOCALE_FONT_CLASS: Record<string, string> = {
  en: "font-mukta",
  hi: "font-mukta",
  mr: "font-mukta",
  ta: "font-noto-tamil",
  te: "font-noto-telugu",
  kn: "font-noto-kannada",
};

export function useLocaleFontClass(): string {
  const locale = useLocale();
  return LOCALE_FONT_CLASS[locale] || "font-mukta";
}
