import { supabaseAdmin } from "@/lib/supabase/admin";
import ClientesTabla from "./ClientesTabla";

export default async function ClientesPage() {
  const { data: clientes } = await supabaseAdmin
    .from("clientes")
    .select("*")
    .order("nombre");

  // Traer notas/remisiones para calcular el saldo por cliente
  const { data: docs } = await supabaseAdmin
    .from("documentos")
    .select("cliente_id, total, monto_pagado")
    .in("tipo", ["nota", "remision"]);

  const saldos: Record<number, number> = {};
  (docs ?? []).forEach((d) => {
    if (d.cliente_id == null) return;
    const s = Number(d.total) - Number(d.monto_pagado);
    saldos[d.cliente_id] = (saldos[d.cliente_id] ?? 0) + s;
  });

  const lista = (clientes ?? []).map((c) => ({
    ...c,
    saldo: saldos[c.id] ?? 0,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--peja-azul)]">Clientes</h1>
      <p className="mb-6 text-sm text-[var(--peja-pizarra)]">
        Administra los clientes de Comercializadora Peja
      </p>
      <ClientesTabla clientes={lista} />
    </div>
  );
}