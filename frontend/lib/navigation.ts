import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "hi", "ta", "te", "kn", "mr"] as const;
export const localePrefix = "as-needed";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix,
});
