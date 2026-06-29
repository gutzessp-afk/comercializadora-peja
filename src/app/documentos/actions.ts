"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Partida = {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
};

export type DocumentoInput = {
  tipo: "cotizacion" | "nota" | "remision";
  cliente_id: number | null;
  aplica_iva: boolean;
  descuento_pct: number;
  notas: string;
  partidas: Partida[];
};

const PREFIJO: Record<string, string> = {
  cotizacion: "COT",
  nota: "NOTA",
  remision: "REM",
};

async function siguienteFolio(tipo: string) {
  const prefijo = PREFIJO[tipo] ?? "DOC";
  const { count } = await supabaseAdmin
    .from("documentos")
    .select("id", { count: "exact", head: true })
    .eq("tipo", tipo);
  const num = (count ?? 0) + 1;
  return `${prefijo}-${String(num).padStart(4, "0")}`;
}

export async function crearDocumento(data: DocumentoInput) {
  const subtotal = data.partidas.reduce((s, p) => s + p.importe, 0);
  const descuentoMonto = subtotal * (data.descuento_pct / 100);
  const base = subtotal - descuentoMonto;
  const iva = data.aplica_iva ? base * 0.16 : 0;
  const total = base + iva;

  const folio = await siguienteFolio(data.tipo);

  const { data: doc, error } = await supabaseAdmin
    .from("documentos")
    .insert({
      tipo: data.tipo,
      folio,
      cliente_id: data.cliente_id,
      subtotal,
      descuento_pct: data.descuento_pct,
      descuento_monto: descuentoMonto,
      aplica_iva: data.aplica_iva,
      iva,
      total,
      estado: "vigente",
      notas: data.notas,
      monto_pagado: 0,
      estado_pago: data.tipo === "cotizacion" ? "n/a" : "pendiente",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  const itemsInsert = data.partidas.map((p) => ({
    documento_id: doc.id,
    descripcion: p.descripcion,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    importe: p.importe,
  }));

  const { error: errItems } = await supabaseAdmin
    .from("documento_items")
    .insert(itemsInsert);

  if (errItems) return { ok: false, error: errItems.message };

  revalidatePath("/documentos");
  return { ok: true, id: doc.id };
}