"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const LOCALES = [
  { code: "en", label: "EN", native: "English" },
  { code: "hi", label: "HI", native: "हिंदी" },
  { code: "ta", label: "TA", native: "தமிழ்" },
  { code: "te", label: "TE", native: "తెలుగు" },
  { code: "kn", label: "KN", native: "ಕನ್ನಡ" },
  { code: "mr", label: "MR", native: "मराठी" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace locale prefix in path
    const segments = pathname.split("/");
    const currentLocaleIndex = LOCALES.map((l) => l.code).includes(segments[1])
      ? 1
      : -1;
    if (currentLocaleIndex > -1) {
      segments[currentLocaleIndex] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    // TODO: persist locale preference to user profile via PATCH /api/users/me/locale

    router.push(segments.join("/") || "/");
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % LOCALES.length;
      switchLocale(LOCALES[nextIdx].code);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + LOCALES.length) % LOCALES.length;
      switchLocale(LOCALES[prevIdx].code);
    }
  };

  return (
    <div role="group" aria-label="Language selector" className="flex items-center gap-1.5 flex-wrap">
      {LOCALES.map((l, index) => (
        <button
          key={l.code}
          role="radio"
          aria-checked={locale === l.code}
          onClick={() => switchLocale(l.code)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          title={l.native}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer select-none ${
            locale === l.code
              ? "bg-[#6B4226] text-white"
              : "border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
