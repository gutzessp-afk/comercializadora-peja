"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Registra un abono (pago completo o a cuenta) sobre una nota/remision
export async function registrarAbono(
  documentoId: number,
  monto: number,
  metodo: string,
  notas?: string
) {
  if (monto <= 0) return { ok: false, error: "El monto debe ser mayor a 0" };

  // 1. Traer el documento
  const { data: doc, error: errDoc } = await supabaseAdmin
    .from("documentos")
    .select("id, total, cliente_id")
    .eq("id", documentoId)
    .single();

  if (errDoc || !doc) return { ok: false, error: "Documento no encontrado" };

  // 2. Insertar el abono
  const { error: errAbono } = await supabaseAdmin.from("abonos_cliente").insert({
    documento_id: documentoId,
    cliente_id: doc.cliente_id,
    monto,
    metodo,
    notas: notas ?? null,
  });
  if (errAbono) return { ok: false, error: errAbono.message };

  // 3. Recalcular el total pagado leyendo TODOS los abonos del documento
  const { data: abonos } = await supabaseAdmin
    .from("abonos_cliente")
    .select("monto")
    .eq("documento_id", documentoId);

  const pagado = (abonos ?? []).reduce((s, a) => s + Number(a.monto), 0);

  let estado: "pendiente" | "parcial" | "pagado" = "pendiente";
  if (pagado >= Number(doc.total)) estado = "pagado";
  else if (pagado > 0) estado = "parcial";

  // 4. Actualizar el documento
  const { error: errUpd } = await supabaseAdmin
    .from("documentos")
    .update({ monto_pagado: pagado, estado_pago: estado })
    .eq("id", documentoId);
  if (errUpd) return { ok: false, error: errUpd.message };

  revalidatePath("/documentos");
  revalidatePath(`/documentos/${documentoId}`);
  revalidatePath("/clientes");
  revalidatePath("/repartos");

  return { ok: true, pagado, estado };
}

// Saldo global de un cliente (suma de lo que debe en notas/remisiones)
export async function saldoCliente(clienteId: number) {
  const { data } = await supabaseAdmin
    .from("documentos")
    .select("total, monto_pagado")
    .eq("cliente_id", clienteId)
    .in("tipo", ["nota", "remision"]);

  const saldo = (data ?? []).reduce(
    (s, d) => s + (Number(d.total) - Number(d.monto_pagado)),
    0
  );
  return saldo;
}