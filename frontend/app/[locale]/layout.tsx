import { Inter, Mukta } from "next/font/google";
import "../globals.css";
import ReactQueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import LayoutWrapper from "@/components/shared/LayoutWrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mukta = Mukta({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mukta",
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
    <html lang={locale} className={`${inter.variable} ${mukta.variable}`}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="font-sans antialiased bg-warm-cream text-charcoal min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster closeButton richColors position="top-right" />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
