"use client";

import { useState } from "react";
import Link from "next/link";
import NuevoReparto from "./NuevoReparto";

type Reparto = {
  id: number;
  fecha: string;
  destino: string;
  chofer?: string;
  estado: string;
  total: number;
  cobrado: number;
};

const ESTADO: Record<string, { label: string; clase: string }> = {
  planeado: { label: "Planeado", clase: "bg-blue-100 text-blue-700" },
  en_ruta: { label: "En ruta", clase: "bg-amber-100 text-amber-700" },
  entregado: { label: "Entregado", clase: "bg-green-100 text-green-700" },
};

export default function RepartosLista({ repartos }: { repartos: Reparto[] }) {
  const [nuevo, setNuevo] = useState(false);

  const fmt = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const fechaFmt = (f: string) =>
    new Date(f + "T00:00:00").toLocaleDateString("es-MX", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--peja-azul)]">Repartos</h1>
          <p className="text-sm text-[var(--peja-pizarra)]">
            Entregas y corte de cobranza
          </p>
        </div>
        <button
          onClick={() => setNuevo(true)}
          className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
        >
          + Nuevo reparto
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Destino</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">A cobrar</th>
              <th className="px-4 py-3 text-right font-semibold">Cobrado</th>
              <th className="px-4 py-3 text-right font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody>
            {repartos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Sin repartos. Crea el primero.
                </td>
              </tr>
            ) : (
              repartos.map((r) => {
                const e = ESTADO[r.estado] ?? ESTADO.planeado;
                return (
                  <tr key={r.id} className="border-t border-[var(--peja-gris)]">
                    <td className="px-4 py-3 font-medium capitalize">{fechaFmt(r.fecha)}</td>
                    <td className="px-4 py-3 text-[var(--peja-pizarra)]">{r.destino}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.clase}`}>
                        {e.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(r.total)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{fmt(r.cobrado)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/repartos/${r.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
                      >
                        Ver corte
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {nuevo && <NuevoReparto onClose={() => setNuevo(false)} />}
    </div>
  );
}