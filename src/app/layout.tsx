import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import { getUsuarioActual } from "@/lib/auth";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Comercializadora Peja",
  description: "Sistema de gestion - Tlapaleria y Ferreteria",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioActual();

  return (
    <html lang="es">
      <body className={ibmPlex.variable}>
        <LayoutClient usuario={usuario}>{children}</LayoutClient>
      </body>
    </html>
  );
}