import type { Metadata } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import LayoutWrapper from "@/components/shared/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mukta = Mukta({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mukta",
});

export const metadata: Metadata = {
  title: "Mandi Mitra - Smart Agriculture Market Pooler",
  description: "Empowering farmers and buyers through real-time community-driven agricultural pooling, bidding, and transparent settlements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mukta.variable}`}>
      <body className="font-sans antialiased bg-warm-cream text-charcoal min-h-screen">
        <ReactQueryProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster closeButton richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
