import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Inter autoalojada (sin llamadas a Google Fonts). Sustituible por la fuente de marca autorizada.
const inter = localFont({
  src: "../fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "400 600",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "OCCIDENT OS", template: "%s · OCCIDENT OS" },
  description: "Herramienta interna de trabajo del agente. Uso privado.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
