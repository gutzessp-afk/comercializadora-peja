import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import DocumentosTabla from "./DocumentosTabla";

export default async function DocumentosPage() {
  const { data: docs } = await supabaseAdmin
    .from("documentos")
    .select("id, tipo, folio, total, monto_pagado, estado_pago, clientes(nombre)")
    .order("id", { ascending: false });

  const lista = (docs ?? []).map((d) => {
    const cliente = Array.isArray(d.clientes)
      ? d.clientes[0]?.nombre
      : (d.clientes as { nombre?: string } | null)?.nombre;
    return {
      id: d.id,
      tipo: d.tipo,
      folio: d.folio,
      total: d.total,
      monto_pagado: d.monto_pagado,
      estado_pago: d.estado_pago,
      cliente: cliente || "Publico general",
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--peja-azul)]">Documentos</h1>
          <p className="text-sm text-[var(--peja-pizarra)]">
            Cotizaciones, notas y remisiones
          </p>
        </div>
        <Link
          href="/documentos/nuevo"
          className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
        >
          + Nuevo documento
        </Link>
      </div>

      <DocumentosTabla docs={lista} />
    </div>
  );
}