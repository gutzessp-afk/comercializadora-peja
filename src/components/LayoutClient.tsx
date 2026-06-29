"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

type Usuario = { nombre: string; email?: string; rol: "admin" | "usuario" } | null;

export default function LayoutClient({
  children,
  usuario,
}: {
  children: React.ReactNode;
  usuario: Usuario;
}) {
  const pathname = usePathname();
  const esLogin = pathname === "/login";

  if (esLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar usuario={usuario} />
      <main className="ml-64 min-h-screen p-8">{children}</main>
    </>
  );
}