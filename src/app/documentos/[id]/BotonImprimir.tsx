"use client";

export default function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] print:hidden"
    >
      Imprimir / Guardar PDF
    </button>
  );
}