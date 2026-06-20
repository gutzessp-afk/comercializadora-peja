"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type EntradaItem = {
  producto_id: number | null;
  descripcion: string;
  cantidad: number;
  costo_unitario: number;
  importe: number;
};

export type EntradaInput = {
  proveedor_id: number | null;
  fecha: string;
  pdf_url: string | null;
  notas: string;
  items: EntradaItem[];
};

async function siguienteFolio() {
  const { count } = await supabaseAdmin
    .from("entradas")
    .select("*", { count: "exact", head: true });
  return `ENT-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

// Crea la entrada Y suma el stock al inventario
export async function crearEntrada(data: EntradaInput) {
  const total = data.items.reduce((s, i) => s + i.importe, 0);
  const folio = await siguienteFolio();

  const { data: entrada, error } = await supabaseAdmin
    .from("entradas")
    .insert({
      folio,
      proveedor_id: data.proveedor_id,
      fecha: data.fecha,
      pdf_url: data.pdf_url,
      notas: data.notas || null,
      total,
      estado: "aplicada",
    })
    .select("id")
    .single();

  if (error || !entrada) return { ok: false, error: error?.message ?? "Error" };

  // Guardar los items
  const items = data.items.map((i) => ({
    entrada_id: entrada.id,
    producto_id: i.producto_id,
    descripcion: i.descripcion,
    cantidad: i.cantidad,
    costo_unitario: i.costo_unitario,
    importe: i.importe,
  }));
  const { error: errItems } = await supabaseAdmin.from("entrada_items").insert(items);
  if (errItems) return { ok: false, error: errItems.message };

  // Sumar stock a los productos existentes
  for (const i of data.items) {
    if (i.producto_id) {
      const { data: prod } = await supabaseAdmin
        .from("productos")
        .select("stock")
        .eq("id", i.producto_id)
        .single();
      if (prod) {
        await supabaseAdmin
          .from("productos")
          .update({ stock: Number(prod.stock) + i.cantidad })
          .eq("id", i.producto_id);
      }
    }
  }

  revalidatePath("/entradas");
  revalidatePath("/inventario");
  return { ok: true, id: entrada.id, folio };
}