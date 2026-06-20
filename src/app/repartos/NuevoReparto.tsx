"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearReparto } from "./actions";

// Calcula el proximo jueves a partir de hoy
function proximoJueves(): string {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=dom, 4=jue
  let faltan = (4 - dia + 7) % 7;
  if (faltan === 0) faltan = 7; // si hoy es jueves, toma el siguiente
  const jueves = new Date(hoy);
  jueves.setDate(hoy.getDate() + faltan);
  return jueves.toISOString().slice(0, 10);
}

export default function NuevoReparto({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [fecha, setFecha] = useState(proximoJueves());
  const [destino, setDestino] = useState("Chimalhuacan");
  const [chofer, setChofer] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (!fecha) {
      setError("Selecciona la fecha");
      return;
    }
    setGuardando(true);
    setError("");
    const res = await crearReparto(fecha, destino, chofer);
    setGuardando(false);
    if (res.ok) {
      onClose();
      router.push(`/repartos/${res.id}`);
    } else {
      setError(res.error ?? "Error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-[var(--peja-azul)]">Nuevo reparto</h2>

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Destino</label>
        <input
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Chofer (opcional)</label>
        <input
          value={chofer}
          onChange={(e) => setChofer(e.target.value)}
          className="mb-4 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear reparto"}
          </button>
        </div>
      </div>
    </div>
  );
}