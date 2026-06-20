import { supabaseAdmin } from "@/lib/supabase/admin";
import RepartosLista from "./RepartosLista";

export default async function RepartosPage() {
  const { data: repartos } = await supabaseAdmin
    .from("repartos")
    .select("id, fecha, destino, chofer, estado")
    .order("fecha", { ascending: false });

  // Traer notas de cada reparto para sumar total y cobrado
  const { data: docs } = await supabaseAdmin
    .from("documentos")
    .select("reparto_id, total, monto_pagado")
    .not("reparto_id", "is", null);

  const acum: Record<number, { total: number; cobrado: number }> = {};
  (docs ?? []).forEach((d) => {
    const rid = d.reparto_id as number;
    if (!acum[rid]) acum[rid] = { total: 0, cobrado: 0 };
    acum[rid].total += Number(d.total);
    acum[rid].cobrado += Number(d.monto_pagado);
  });

  const lista = (repartos ?? []).map((r) => ({
    ...r,
    total: acum[r.id]?.total ?? 0,
    cobrado: acum[r.id]?.cobrado ?? 0,
  }));

  return <RepartosLista repartos={lista} />;
}