"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  asignarDocumento,
  quitarDocumento,
  cambiarEstadoReparto,
} from "../actions";

type Doc = {
  id: number;
  folio: string;
  total: number;
  monto_pagado: number;
  estado_pago: string;
  cliente: string;
};

type Props = {
  repartoId: number;
  estado: string;
  asignados: Doc[];
  disponibles: Doc[];
};

const fmt = (n: number) =>
  Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function CorteReparto({
  repartoId,
  estado,
  asignados,
  disponibles,
}: Props) {
  const router = useRouter();
  const [agregar, setAgregar] = useState(false);

  const totalCobrar = asignados.reduce((s, d) => s + Number(d.total), 0);
  const totalCobrado = asignados.reduce((s, d) => s + Number(d.monto_pagado), 0);
  const totalPendiente = totalCobrar - totalCobrado;

  async function asignar(docId: number) {
    await asignarDocumento(docId, repartoId);
    router.refresh();
  }
  async function quitar(docId: number) {
    await quitarDocumento(docId, repartoId);
    router.refresh();
  }
  async function cambiarEstado(nuevo: string) {
    await cambiarEstadoReparto(repartoId, nuevo);
    router.refresh();
  }

  return (
    <div>
      {/* Resumen del corte */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--peja-gris)] bg-white p-5">
          <div className="text-xs uppercase text-[var(--peja-pizarra)]">A cobrar</div>
          <div className="mt-1 text-2xl font-bold text-[var(--peja-azul)]">{fmt(totalCobrar)}</div>
        </div>
        <div className="rounded-xl border border-[var(--peja-gris)] bg-white p-5">
          <div className="text-xs uppercase text-[var(--peja-pizarra)]">Cobrado</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{fmt(totalCobrado)}</div>
        </div>
        <div className="rounded-xl border border-[var(--peja-gris)] bg-white p-5">
          <div className="text-xs uppercase text-[var(--peja-pizarra)]">Pendiente / a cuenta</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{fmt(totalPendiente)}</div>
        </div>
      </div>

      {/* Estado del reparto */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-[var(--peja-pizarra)]">Estado:</span>
        {["planeado", "en_ruta", "entregado"].map((e) => (
          <button
            key={e}
            onClick={() => cambiarEstado(e)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold capitalize " +
              (estado === e
                ? "bg-[var(--peja-azul)] text-white"
                : "border border-[var(--peja-gris)] text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]")
            }
          >
            {e.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Notas del reparto */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--peja-azul)]">Notas en este reparto</h2>
        <button
          onClick={() => setAgregar(!agregar)}
          className="rounded-md bg-[var(--peja-azul)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--peja-azul-hover)]"
        >
          {agregar ? "Cerrar" : "+ Agregar notas"}
        </button>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Folio</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Pagado</th>
              <th className="px-4 py-3 text-right font-semibold">Saldo</th>
              <th className="px-4 py-3 text-right font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {asignados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Aun no hay notas en este reparto
                </td>
              </tr>
            ) : (
              asignados.map((d) => {
                const saldo = Number(d.total) - Number(d.monto_pagado);
                return (
                  <tr key={d.id} className="border-t border-[var(--peja-gris)]">
                    <td className="px-4 py-3 font-semibold text-[var(--peja-azul)]">{d.folio}</td>
                    <td className="px-4 py-3 text-[var(--peja-pizarra)]">{d.cliente}</td>
                    <td className="px-4 py-3 text-right">{fmt(d.total)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{fmt(d.monto_pagado)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{fmt(saldo)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => quitar(d.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Panel para agregar notas disponibles */}
      {agregar && (
        <div className="rounded-xl border border-[var(--peja-azul)] bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-[var(--peja-azul)]">
            Notas disponibles (sin reparto)
          </h3>
          {disponibles.length === 0 ? (
            <p className="text-sm text-[var(--peja-pizarra)]">
              No hay notas/remisiones libres. Crea una en Documentos.
            </p>
          ) : (
            <div className="space-y-2">
              {disponibles.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--peja-gris)] px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-semibold text-[var(--peja-azul)]">{d.folio}</span>{" "}
                    <span className="text-[var(--peja-pizarra)]">— {d.cliente}</span>{" "}
                    <span className="text-gray-500">({fmt(d.total)})</span>
                  </span>
                  <button
                    onClick={() => asignar(d.id)}
                    className="rounded bg-[var(--peja-azul)] px-2.5 py-1 text-xs font-medium text-white hover:bg-[var(--peja-azul-hover)]"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}