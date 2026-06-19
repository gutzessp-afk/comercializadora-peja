"use client";

import { useState } from "react";
import Link from "next/link";
import CobroModal from "./CobroModal";
import EstadoPago from "@/components/EstadoPago";

type Doc = {
  id: number;
  tipo: string;
  folio: string;
  total: number;
  monto_pagado: number;
  estado_pago: string;
  cliente: string;
};

const TIPO_LABEL: Record<string, string> = {
  cotizacion: "Cotizacion",
  nota: "Nota",
  remision: "Remision",
};

export default function DocumentosTabla({ docs }: { docs: Doc[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [cobrando, setCobrando] = useState<Doc | null>(null);

  const fmt = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const filtrados = docs.filter((d) =>
    [d.folio, d.cliente, TIPO_LABEL[d.tipo]]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Buscar por folio, cliente o tipo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full max-w-md rounded-md border border-[var(--peja-gris)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
      />

      <div className="overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Folio</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Saldo</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Sin documentos
                </td>
              </tr>
            ) : (
              filtrados.map((d) => {
                const saldo = Number(d.total) - Number(d.monto_pagado);
                const esCotizacion = d.tipo === "cotizacion";
                return (
                  <tr key={d.id} className="border-t border-[var(--peja-gris)]">
                    <td className="px-4 py-3 font-semibold text-[var(--peja-azul)]">{d.folio}</td>
                    <td className="px-4 py-3">{TIPO_LABEL[d.tipo] ?? d.tipo}</td>
                    <td className="px-4 py-3 text-[var(--peja-pizarra)]">{d.cliente}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(d.total)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {esCotizacion ? "-" : fmt(saldo)}
                    </td>
                    <td className="px-4 py-3">
                      {esCotizacion ? (
                        <span className="text-xs text-[var(--peja-pizarra)]">N/A</span>
                      ) : (
                        <EstadoPago estado={d.estado_pago} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!esCotizacion && saldo > 0.01 && (
                        <button
                          onClick={() => setCobrando(d)}
                          className="mr-2 rounded bg-[var(--peja-azul)] px-2.5 py-1 text-xs font-medium text-white hover:bg-[var(--peja-azul-hover)]"
                        >
                          Cobrar
                        </button>
                      )}
                      <Link
                        href={`/documentos/${d.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {cobrando && (
        <CobroModal
          documentoId={cobrando.id}
          folio={cobrando.folio}
          total={Number(cobrando.total)}
          pagado={Number(cobrando.monto_pagado)}
          onClose={() => setCobrando(null)}
        />
      )}
    </div>
  );
}