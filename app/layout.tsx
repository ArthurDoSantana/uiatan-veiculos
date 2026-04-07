import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Uiatan Veículos — Garagem Premium em Canguçu",
  description:
    "Encontre o veículo dos seus sonhos na Uiatan Veículos. Carros, SUVs e utilitários com procedência garantida em Canguçu, RS.",
  keywords: "carros, veículos, comprar carro, Canguçu, RS, Uiatan Veículos",
  openGraph: {
    title: "Uiatan Veículos",
    description: "Garagem Premium em Canguçu, RS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0f3d1e",
              color: "#fff",
              border: "1px solid #145c2e",
            },
          }}
        />
      </body>
    </html>
  );
}
