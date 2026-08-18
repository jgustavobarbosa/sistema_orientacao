import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOAI — Sistema de Orientação Acadêmica Inteligente",
  description: "Plataforma pessoal para gestão de orientandos, atas estruturadas e análises acadêmicas por IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col text-slate-50 antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
