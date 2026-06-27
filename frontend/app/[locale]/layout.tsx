import { Inter, Mukta, Noto_Sans_Telugu, Noto_Sans_Kannada, Noto_Sans_Tamil } from "next/font/google";
import "../globals.css";
import ReactQueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import { ConditionalSidebar } from "@/components/shared/ConditionalSidebar";
import { ConditionalContentWrapper } from "@/components/shared/ConditionalContentWrapper";
import { LocaleFontWrapper } from "@/components/shared/LocaleFontWrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-telugu",
  display: "swap",
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kannada",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tamil",
  display: "swap",
});

const locales = ["en", "hi", "ta", "te", "kn", "mr"];

export const metadata = {
  title: "Mandi Mitra - Smart Agriculture Market Pooler",
  description:
    "Empowering farmers and buyers through real-time community-driven agricultural pooling, bidding, and transparent settlements.",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${mukta.variable} ${notoTelugu.variable} ${notoKannada.variable} ${notoTamil.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="font-sans antialiased bg-warm-cream text-charcoal min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ReactQueryProvider>
            <LocaleFontWrapper>
              <div className="flex min-h-screen bg-[#FBF7F0]">
                <ConditionalSidebar />
                <ConditionalContentWrapper>{children}</ConditionalContentWrapper>
              </div>
            </LocaleFontWrapper>
            <Toaster closeButton richColors position="top-right" />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
