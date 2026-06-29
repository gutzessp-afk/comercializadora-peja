"use client";

import { useState } from "react";
import { crearCompra } from "./actions";
import SubirPdfProv from "./SubirPdfProv";

export default function CompraModal({
  proveedorId,
  proveedorNombre,
  onClose,
}: {
  proveedorId: number;
  proveedorNombre: string;
  onClose: () => void;
}) {
  const [folio, setFolio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [total, setTotal] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    const monto = parseFloat(total);
    if (!monto || monto <= 0) {
      setError("Ingresa el monto de la deuda");
      return;
    }
    setGuardando(true);
    setError("");
    const res = await crearCompra({
      proveedor_id: proveedorId,
      folio,
      descripcion,
      total: monto,
      fecha_vencimiento: vencimiento || null,
      pdf_url: pdfUrl,
    });
    setGuardando(false);
    if (res.ok) onClose();
    else setError(res.error ?? "Error");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-[var(--peja-azul)]">Registrar deuda</h2>
        <p className="mb-4 text-sm text-[var(--peja-pizarra)]">{proveedorNombre}</p>

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Folio / No. factura</label>
        <input value={folio} onChange={(e) => setFolio(e.target.value)} className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />

        <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Descripcion</label>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Que compraste" className="mb-3 w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Monto total</label>
            <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Fecha de pago</label>
            <input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]" />
          </div>
        </div>

        <div className="mb-4">
          <SubirPdfProv onSubido={setPdfUrl} />
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50">
            {guardando ? "Guardando..." : "Registrar deuda"}
          </button>
        </div>
      </div>
    </div>
  );
}