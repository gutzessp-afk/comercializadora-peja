"use client";

import { useState } from "react";
import { registrarPagoProveedor } from "./actions";

const METODOS = [
  { v: "efectivo", label: "Efectivo" },
  { v: "transferencia", label: "Transferencia" },
  { v: "cheque", label: "Cheque" },
];

export default function PagoProvModal({
  compraId,
  folio,
  total,
  pagado,
  onClose,
}: {
  compraId: number;
  folio: string;
  total: number;
  pagado: number;
  onClose: () => void;
}) {
  const saldo = total - pagado;
  const [monto, setMonto] = useState(saldo.toFixed(2));
  const [metodo, setMetodo] = useState("efectivo");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  async function guardar() {
    const m = parseFloat(monto);
    if (!m || m <= 0) {
      setError("Monto invalido");
      return;
    }
    if (m > saldo + 0.01) {
      setError(`No puede ser mayor al saldo (${fmt(saldo)})`);
      return;
    }
    setGuardando(true);
    setError("");
    const res = await registrarPagoProveedor(compraId, m, metodo);
    setGuardando(false);
    if (res.ok) onClose();
    else setError(res.error ?? "Error");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-[var(--peja-azul)]">Registrar pago</h2>
        <p className="mb-4 text-sm text-[var(--peja-pizarra)]">{folio}</p>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-[var(--peja-neutro)] p-3 text-center text-sm">
          <div>
            <div className="text-xs text-[var(--peja-pizarra)]">Total</div>
            <div className="font-semibold">{fmt(total)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--peja-pizarra)]">Pagado</div>
            <div className="font-semibold text-green-600">{fmt(pagado)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--peja-pizarra)]">Saldo</div>
            <div className="font-semibold text-red-600">{fmt(saldo)}</div>
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Monto a pagar</label>
        <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Metodo</label>
        <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="mb-4 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]">
          {METODOS.map((m) => (
            <option key={m.v} value={m.v}>{m.label}</option>
          ))}
        </select>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50">
            {guardando ? "Registrando..." : "Registrar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}