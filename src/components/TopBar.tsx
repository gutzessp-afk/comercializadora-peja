"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/clientes", label: "Clientes" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/inventario", label: "Inventario" },
  { href: "/documentos", label: "Documentos" },
  { href: "/repartos", label: "Repartos" },
];

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--peja-gris)] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-[var(--peja-azul)]">
              COMERCIALIZADORA
            </div>
            <div className="text-[11px] font-semibold tracking-[0.3em] text-[var(--peja-pizarra)]">
              P E J A
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-[var(--peja-azul)] text-white"
                    : "text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)] hover:text-[var(--peja-azul)]")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
