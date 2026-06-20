import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import CorteReparto from "./CorteReparto";

function mapDoc(d: {
  id: number;
  folio: string;
  total: number;
  monto_pagado: number;
  estado_pago: string;
  clientes: { nombre?: string } | { nombre?: string }[] | null;
}) {
  const c = Array.isArray(d.clientes) ? d.clientes[0] : d.clientes;
  return {
    id: d.id,
    folio: d.folio,
    total: d.total,
    monto_pagado: d.monto_pagado,
    estado_pago: d.estado_pago,
    cliente: c?.nombre || "Publico general",
  };
}

export default async function RepartoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: reparto } = await supabaseAdmin
    .from("repartos")
    .select("*")
    .eq("id", id)
    .single();

  if (!reparto) notFound();

  // Notas/remisiones de este reparto
  const { data: asignadosRaw } = await supabaseAdmin
    .from("documentos")
    .select("id, folio, total, monto_pagado, estado_pago, clientes(nombre)")
    .eq("reparto_id", id)
    .in("tipo", ["nota", "remision"]);

  // Notas/remisiones libres (sin reparto)
  const { data: disponiblesRaw } = await supabaseAdmin
    .from("documentos")
    .select("id, folio, total, monto_pagado, estado_pago, clientes(nombre)")
    .is("reparto_id", null)
    .in("tipo", ["nota", "remision"]);

  const fecha = new Date(reparto.fecha + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <Link
        href="/repartos"
        className="text-sm font-medium text-[var(--peja-pizarra)] hover:text-[var(--peja-azul)]"
      >
        &larr; Volver a repartos
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-[var(--peja-azul)] capitalize">
        Reparto — {reparto.destino}
      </h1>
      <p className="mb-6 text-sm capitalize text-[var(--peja-pizarra)]">
        {fecha}
        {reparto.chofer ? ` · Chofer: ${reparto.chofer}` : ""}
      </p>

      <CorteReparto
        repartoId={reparto.id}
        estado={reparto.estado}
        asignados={(asignadosRaw ?? []).map(mapDoc)}
        disponibles={(disponiblesRaw ?? []).map(mapDoc)}
      />
    </div>
  );
}