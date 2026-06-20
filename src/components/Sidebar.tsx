"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  FileText,
  Users,
  Truck,
  MapPin,
  PlusCircle,
  HelpCircle,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
   { href: "/entradas", label: "Entradas", icon: PackagePlus },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/repartos", label: "Repartos", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--peja-gris)] bg-white">
      {/* Logo / marca */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo size={34} />
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-[var(--peja-azul)]">
            Comercializadora Peja
          </div>
          <div className="text-[10px] font-semibold tracking-[0.15em] text-[var(--peja-pizarra)]">
            OPERACIONES INDUSTRIALES
          </div>
        </div>
      </div>

      {/* Navegacion */}
      <nav className="flex-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-[var(--peja-azul)] text-white"
                  : "text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)] hover:text-[var(--peja-azul)]")
              }
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Boton Nueva Cotizacion */}
      <div className="px-3 pb-2">
        <Link
          href="/documentos"
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--peja-azul)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
        >
          <PlusCircle size={18} />
          Nueva Cotizacion
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--peja-gris)] px-3 py-3">
        <button className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
          <HelpCircle size={18} />
          Ayuda
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
          <LogOut size={18} />
          Cerrar Sesion
        </button>
      </div>
    </aside>
  );
}