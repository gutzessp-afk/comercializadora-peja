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
  notas?: string;
  partidas: Partida[];
};

const PREFIJO: Record<string, string> = {
  cotizacion: "COT",
  nota: "NOTA",
  remision: "REM",
};

async function siguienteFolio(tipo: string) {
  const { count } = await supabaseAdmin
    .from("documentos")
    .select("*", { count: "exact", head: true })
    .eq("tipo", tipo);
  const num = (count ?? 0) + 1;
  return `${PREFIJO[tipo]}-${String(num).padStart(4, "0")}`;
}

export async function crearDocumento(data: DocumentoInput) {
  const subtotal = data.partidas.reduce((s, p) => s + p.importe, 0);
  const iva = data.aplica_iva ? subtotal * 0.16 : 0;
  const total = subtotal + iva;
  const folio = await siguienteFolio(data.tipo);

  const { data: doc, error } = await supabaseAdmin
    .from("documentos")
    .insert({
      tipo: data.tipo,
      folio,
      cliente_id: data.cliente_id,
      subtotal,
      aplica_iva: data.aplica_iva,
      iva,
      total,
      notas: data.notas ?? null,
    })
    .select("id")
    .single();

  if (error || !doc) return { ok: false, error: error?.message ?? "Error" };

  const items = data.partidas.map((p) => ({
    documento_id: doc.id,
    descripcion: p.descripcion,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    importe: p.importe,
  }));

  const { error: errItems } = await supabaseAdmin
    .from("documento_items")
    .insert(items);

  if (errItems) return { ok: false, error: errItems.message };

  revalidatePath("/documentos");
  return { ok: true, id: doc.id, folio };
}

export async function eliminarDocumento(id: number) {
  const { error } = await supabaseAdmin
    .from("documentos")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/documentos");
  return { ok: true };
}