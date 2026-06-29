"use client";

import { cerrarSesion } from "@/app/logout/actions";
import { LogOut } from "lucide-react";

export default function BotonSalir() {
  return (
    <button
      onClick={() => cerrarSesion()}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      <LogOut size={18} />
      Cerrar Sesion
    </button>
  );
}