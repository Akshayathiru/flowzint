import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async (context) => {
  let locale = (context as any).locale;
  if (!locale && (context as any).requestLocale) {
    locale = await (context as any).requestLocale;
  }
  const currentLocale = locale || "en";
  
  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
